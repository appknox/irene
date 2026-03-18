---
title: AkDrawer
order: 11
manualDemoInsertion: true
---

# AkDrawer

Slide-out panel from the **left** or **right** edge of the screen. Renders into the `ak-component-wormhole` target with a backdrop. Used for sidebars, filters, and detail views.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | boolean | `false` | When true, the drawer and backdrop mount. |
| `anchor` | string | `'left'` | `left` or `right`. |
| `onClose` | function | required | Called when the drawer should close (backdrop click, `closeHandler`, etc.). **Required.** |
| `disableBackdropClick` | boolean | `false` | If true, clicking the backdrop does not call `onClose`. |

### Block

The default block receives a single hash:

| Key | Type | Description |
| --- | --- | --- |
| `closeHandler` | function | Call to run the same close flow as the backdrop (animation, then `onClose`). |

Panel width and inner layout are controlled by your own markup inside the block (for example a `div` with `width` in `style` or CSS).

## Examples

[[demos-all]]
