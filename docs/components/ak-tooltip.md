---
title: AkTooltip
order: 29
---

# AkTooltip

Tooltip on hover. Wraps content and shows tooltip on mouse enter.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | - | Tooltip text |
| `placement` | Placement | - | Popper placement |
| `arrow` | boolean | `false` | Show arrow |
| `color` | string | `'dark'` | light or dark |
| `disabled` | boolean | `false` | Disable tooltip |
| `renderInPlace` | boolean | `false` | Render in place |
| `enterDelay` | number | - | Delay before show (ms) |
| `leaveDelay` | number | - | Delay before hide (ms) |
| `onOpen` | function | - | Open callback |
| `onClose` | function | - | Close callback |

## Blocks

- `default` – Trigger element (hover target)
- `tooltipContent` – Custom tooltip content (overrides title)

## Examples

### Basic Tooltip

```hbs preview-template
<AkTooltip @title="I am a tooltip!" @placement="bottom" @arrow={{true}} @color="dark">
  <AkLink>Link with tooltip</AkLink>
</AkTooltip>
```

### Placements

```hbs preview-template
<div style="display: flex; gap: 12px; flex-wrap: wrap">
  <AkTooltip @title="left" @placement="left" @arrow={{true}}>
    <AkLink>Left</AkLink>
  </AkTooltip>
  <AkTooltip @title="top" @placement="top" @arrow={{true}}>
    <AkLink>Top</AkLink>
  </AkTooltip>
  <AkTooltip @title="bottom" @placement="bottom" @arrow={{true}}>
    <AkLink>Bottom</AkLink>
  </AkTooltip>
  <AkTooltip @title="right" @placement="right" @arrow={{true}}>
    <AkLink>Right</AkLink>
  </AkTooltip>
</div>
```
