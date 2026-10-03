import { expect, mock, test } from 'claude-code/testing'

import { heat } from './register'

const USAGE = {
  startedAt: 0,
  context: { tokens: 106_700, window: 1_000_000, percent: 11 },
  rateLimits: [
    { kind: 'five_hour', percentUsed: 24, resetsAt: '2026-10-03T14:00:00Z' },
    { kind: 'seven_day', percentUsed: 58, resetsAt: '2026-10-07T09:00:00Z' },
  ],
  cost: { usd: 1.42 },
}

test('heat goes from green at 0% to red at 100%', () => {
  expect(heat(0)).toBe('#00ff00')
  expect(heat(50)).toBe('#ffff00')
  expect(heat(100)).toBe('#ff0000')
  expect(heat(250)).toBe('#ff0000')
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`prompt hint line shows full words and colors on ${surface}`, async ($, on) => {
    on('session.usage', () => ({ value: USAGE }))
    on('session.measure', (_$, e) => ({ changed: e.changed }))
    on('ui.render', ($, e) => {
      const { Text } = $.ui.resolve(e)
      return <Text dimColor>? for shortcuts</Text>
    })
    mock.clock(on, { now: Date.parse('2026-10-03T11:46:00Z') })

    await $.session.measure({
      context: USAGE.context,
      rateLimits: USAGE.rateLimits,
      cost: USAGE.cost,
      changed: ['context', 'rateLimits'],
    })

    const viewport = { columns: 220, rows: 40 }
    const ui = await $.ui.mount({
      plugin: 'usage-live',
      surface,
      component: 'PromptHint',
      viewport,
      props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
    })

    const line = await ui.find({ type: 'Text', text: /^└ Context {2}/ })
    expect(line?.text).toBe(
      '└ Context  ━───────── 11%  107k/1M' +
        '   │   5-hour  ━━──────── 24%  resets in 2h 14m' +
        '   │   Weekly  ━━━━━━──── 58%  resets in 3d 21h' +
        '   │   Cost $1.42',
    )
    expect(line?.props).toMatchObject({ wrap: 'truncate-end' })
    expect((await ui.find({ type: 'Text', text: /^━{6}$/ }))?.props).toMatchObject({ color: heat(58) })
    expect((await ui.find({ type: 'Text', text: /^ 24%$/ }))?.props).toMatchObject({ color: heat(24) })
    expect(await ui.find({ type: 'Text', text: /^─+$/ })).toBeDefined()
    expect(await ui.find({ text: '? for shortcuts' })).toBeDefined()
  })
}
