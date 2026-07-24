---
title: AkDrawer
order: 11
---

# AkDrawer

Slide-out panel from the edge of the screen. Used for sidebars, filters, and detail views.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `anchor` | string | `'right'` | Position: left, right, top, or bottom |
| `open` | boolean | `false` | Whether drawer is open |
| `onClose` | function | - | Callback when drawer should close |
| `width` | string | - | Width for left/right drawers |
| `height` | string | - | Height for top/bottom drawers |

## Examples

Drawer requires `open` and `onClose` for controlled state. Use in your app with state management.
