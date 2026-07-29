---
title: AkModal
order: 18
---

# AkModal

Modal dialog overlay. Displays content in a centered overlay with optional header and footer.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `showHeader` | boolean | - | Show header section |
| `headerTitle` | string | - | Header title text |
| `onClose` | function | required | Callback when modal closes |
| `disableClose` | boolean | `false` | Prevent closing |
| `disableOverlayClick` | boolean | `false` | Prevent close on overlay click |
| `blurOverlay` | boolean | `false` | Blur background |
| `noGutter` | boolean | `false` | Remove padding |

## Examples

Modal requires `onClose` callback. Use with `{{#if this.showModal}}` pattern in your app.
