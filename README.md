# usage-live

A Claude Code plugin. It draws one line under the prompt with the context fill, the 5-hour and weekly limits, and the session cost. Each bar changes from green at 0% to red at 100%.

```
└ Context  ━───────── 11%  107k/1M   │   5-hour  ━━──────── 24%  resets in 2h 14m   │   Weekly  ━━━━━━──── 58%  resets in 3d 21h   │   Cost $1.42
```

## Install

Install it from the `bodypas-mods` marketplace:

```
/plugin marketplace add bodypas/claude-mods
/plugin install usage-live@bodypas-mods
```

## Develop

```
claude plugin validate .
claude plugin test .
```
