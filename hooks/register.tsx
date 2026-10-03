import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Snapshot } from '../types'

const snapshot = atom({ plugin: 'usage-live', key: 'snapshot' } as const, null)
const NAMES: Record<string, string> = { five_hour: '5-hour', seven_day: 'Weekly' }

// 0% is green, 50% is yellow, 100% is red.
export const heat = (percent: number) => {
  const p = Math.min(100, Math.max(0, percent)) / 100
  const hex = (n: number) => Math.round(Math.min(255, n)).toString(16).padStart(2, '0')
  return `#${hex(510 * p)}${hex(510 * (1 - p))}00`
}

// A thin bar: the used part is a heavy line, the rest a light dim line.
const BAR = 10
const filled = (percent: number) => Math.min(BAR, Math.max(0, Math.round((percent / 100) * BAR)))

const tokens = (n: number) =>
  n >= 1e6 ? `${Math.round(n / 1e5) / 10}M` : `${Math.round(n / 1e3)}k`

const left = (resetsAt: string | undefined, now: number) => {
  if (!resetsAt) return ''
  const m = Math.max(0, Math.round((Date.parse(resetsAt) - now) / 60000))
  const [d, h] = [Math.floor(m / 1440), Math.floor((m % 1440) / 60)]
  return `resets in ${d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m % 60}m` : `${m}m`}`
}

const refresh = async ($: EngineInterface) => {
  const { context, rateLimits, cost } = await $.session.usage()
  const snap: Snapshot = { ...context, limits: rateLimits, usd: cost?.usd }
  await update($, snapshot, () => snap)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => (await refresh($), next(e)))
  on('session.measure', async ($, e, next) => (await refresh($), next(e)))

  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const engineLine = await next(e)
    const snap = await read($, snapshot)
    if (snap === null) return engineLine

    const { Box, Text } = $.ui.resolve(e)
    const now = await $.clock.now()
    const gauge = (name: string, percent: number, detail: string) => (
      <Text>
        {name}
        {'  '}
        <Text color={heat(percent)}>{'━'.repeat(filled(percent))}</Text>
        <Text dimColor>{'─'.repeat(BAR - filled(percent))}</Text>
        <Text color={heat(percent)}> {percent}%</Text>
        <Text dimColor>{'  '}{detail}</Text>
      </Text>
    )
    const used = snap.tokens === undefined ? '–' : tokens(snap.tokens)

    return (
      <Box flexDirection="column">
        {engineLine}
        <Box>
          <Text wrap="truncate-end">
            <Text dimColor>{'└ '}</Text>
            {gauge('Context', snap.percent ?? 0, `${used}/${tokens(snap.window)}`)}
            {snap.limits.map(l => (
              <Text>
                <Text dimColor>{'   │   '}</Text>
                {gauge(NAMES[l.kind] ?? l.kind, l.percentUsed, left(l.resetsAt, now))}
              </Text>
            ))}
            {snap.usd !== undefined && (
              <Text dimColor>
                {'   │   '}Cost ${snap.usd.toFixed(2)}
              </Text>
            )}
          </Text>
        </Box>
      </Box>
    )
  })
}
