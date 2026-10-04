# usage-live

A Claude Code plugin. It draws one line under the prompt with the context fill, the 5-hour and weekly limits, and the session cost. Each bar changes from green at 0% to red at 100%.

![The usage-live line under the Claude Code prompt](docs/preview.svg)

_The image shows example figures. It is drawn from the same text and colors that the plugin draws._

## Install

Install it from the `bodypas-mods` marketplace:

```
/plugin marketplace add bodypas/claude-mods
/plugin install usage-live@bodypas-mods
```

## Privacy

The plugin collects no data and sends no data. It reads the usage figures of your own session from Claude Code (context fill, rate-limit windows, session cost) and draws them in your terminal. It makes no network requests and writes no files.

## Support

Open an issue at https://github.com/bodypas/claude-usage-live/issues.

## Develop

```
claude plugin validate .
claude plugin test .
```
