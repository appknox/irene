---
title: AkClipboard
order: 8
manualDemoInsertion: true
---

# AkClipboard

Wraps [Clipboard.js](https://clipboardjs.com/) (v2). At construction time it binds to **exactly one** trigger selector: `#<triggerId>`. Yield `triggerId` and set `id={{cb.triggerId}}` on that trigger (typically an `AkButton`). ClipboardJS reads `data-clipboard-text` and/or `data-clipboard-target` from that trigger element.

## API Reference

| Prop        | Type     | Default                 | Description                                                                      |
| ----------- | -------- | ----------------------- | -------------------------------------------------------------------------------- |
| `id`        | string   | auto (`ak-clipboard-…`) | Optional fixed id for the trigger; must match the DOM id you put on the trigger. |
| `options`   | object   | -                       | Second argument to the ClipboardJS constructor.                                  |
| `onSuccess` | function | -                       | `(event) => void` — fired after a successful copy (`event.text`, etc.).          |
| `onError`   | function | -                       | `(event) => void` — fired when copy is not allowed or fails.                     |

### Yielded block

| Name        | Type   | Description                                                                       |
| ----------- | ------ | --------------------------------------------------------------------------------- |
| `triggerId` | string | Use as `id={{cb.triggerId}}` on the trigger element ClipboardJS should attach to. |

## Behaviour

- **Fixed string:** put `data-clipboard-text="Your text"` on the trigger (any string you want).
- **Another element:** put `data-clipboard-target="#some-id"` on the trigger; the target must expose a current `value` (e.g. `<input>` or `AkTextField`). For live typing, bind `@value` with `@tracked` state and `{{on 'input' …}}` so the DOM value matches what the user entered.
- Use **unique** target ids when several clipboards appear on one page.
- The ClipboardJS instance is **destroyed** in `willDestroy`.

## Examples

[[demos-all]]
