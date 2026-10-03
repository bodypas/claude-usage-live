export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

export type Snapshot = { tokens?: number; window: number; percent?: number; limits: Limit[]; usd?: number }

declare module 'claude-code' {
  interface PluginState {
    'usage-live': { snapshot: Snapshot | null }
  }
}
