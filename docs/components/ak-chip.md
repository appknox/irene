---
title: AkChip
order: 7
manualDemoInsertion: true
---

# AkChip

Compact element that represents an input, attribute, or action. Often used for tags and filters.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | - | Chip label text |
| `variant` | string | `'filled'` | filled, outlined, semi-filled, semi-filled-outlined |
| `color` | string | `'default'` | Color theme |
| `size` | string | `'medium'` | medium or small |
| `button` | boolean | `false` | Make chip clickable |
| `onDelete` | function | - | Callback when delete icon is clicked |
| `onClick` | function | - | Callback when chip is clicked |

## Blocks

- `icon` – Custom icon content

## Examples

### Default

```hbs preview-template
<AkChip @label="Chip filled" @color="default" @variant="filled" @size="medium" />
```

### With Icon

```hbs preview-template
<div style="display: flex; flex-wrap: wrap; gap: 12px;">
  <AkChip @label="Security" @variant="filled" @size="medium" @color="default">
    <:icon>
      <AkIcon @iconName="security" />
    </:icon>
  </AkChip>
  <AkChip @label="Security" @variant="outlined" @size="medium" @color="default">
    <:icon>
      <AkIcon @iconName="security" />
    </:icon>
  </AkChip>
  <AkChip @label="Security" @variant="semi-filled" @size="medium" @color="default">
    <:icon>
      <AkIcon @iconName="security" />
    </:icon>
  </AkChip>
  <AkChip @label="Security" @variant="semi-filled-outlined" @size="medium" @color="default">
    <:icon>
      <AkIcon @iconName="security" />
    </:icon>
  </AkChip>
</div>
```

### Deletable

[[demo:deletable]]

Pass `@onDelete` callback to show delete icon. Use `@button={{true}}` for clickable chip.
