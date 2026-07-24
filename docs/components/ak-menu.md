---
title: AkMenu
order: 17
manualDemoInsertion: true
---

# AkMenu

Dropdown menu positioned relative to an anchor element. Uses AkPopover internally. Requires `anchorRef` (set on trigger click) and `onClose` callback.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `anchorRef` | HTMLElement | - | Element to anchor menu to |
| `offset` | [number, number] | [0, 3] | Popper offset |
| `renderInPlace` | boolean | `false` | Render in place |
| `arrow` | boolean | `false` | Show arrow |
| `sameWidthAsRef` | boolean | `false` | Match anchor width |
| `role` | string | - | ARIA role |
| `onClose` | function | - | Callback when menu closes |

## Blocks

- `default` – Yields `listItem` (bound AkList::Item with @button). Use `li.leftIcon`, `li.text`, `li.rightIcon` for item content.

## Examples

Demos run in this order: **Default** → **With Icon** → **Disabled** (via `order` in each demo’s front matter).

[[demos-all]]
