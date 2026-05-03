---
title: AkPopover
order: 20
manualDemoInsertion: true
---

# AkPopover

Floating popover positioned via Popper.js. Requires `anchorRef` (set on trigger click) and `closeHandler` / `onBackdropClick` to close.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `anchorRef` | HTMLElement | - | Element to anchor to |
| `placement` | Placement | `'auto'` | Popper placement |
| `arrow` | boolean | `false` | Show arrow |
| `arrowColor` | string | - | light or dark |
| `sameWidthAsRef` | boolean | `false` | Match anchor width |
| `modifiers` | array | - | Popper modifiers |
| `renderInPlace` | boolean | `false` | Render in place |
| `containerClass` | string | - | Container class |
| `hasBackdrop` | boolean | `false` | Show backdrop |
| `clickOutsideToClose` | boolean | `false` | Close on outside click |
| `closeHandler` | function | - | Called when closing |
| `onBackdropClick` | function | - | Backdrop click callback |
| `mountOnOpen` | boolean | `true` | Mount only when open |
| `unmountOnClose` | boolean | `true` | Unmount when closed |

## Blocks

- `default` – Popover content

## Examples

[[demos-all]]
