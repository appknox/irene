---
title: AkIcon
order: 13
---

# AkIcon

Icon component that displays icons from the iconify library (Material Symbols, etc.).

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `iconName` | string | required | Icon name (e.g. delete, refresh, note-add) |
| `size` | string | `'medium'` | medium or small |
| `color` | string | - | Color variant (textPrimary, success, error, etc.) |

## Examples

### Default

```hbs preview-template
<AkIcon @iconName="delete" @color="textPrimary" @size="medium" />
```

### Variants

```hbs preview-template
<div style="display: flex; gap: 16px; flex-wrap: wrap;">
  <AkIcon @iconName="delete" />
  <AkIcon @iconName="refresh" />
  <AkIcon @iconName="note-add" />
  <AkIcon @iconName="account-box" />
  <AkIcon @iconName="folder" />
</div>
```

### Sizes and Colors

```hbs preview-template
<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
  <AkIcon @iconName="delete" @size="small" />
  <AkIcon @iconName="delete" @size="medium" />
  <AkIcon @iconName="check-circle" @color="success" />
  <AkIcon @iconName="error" @color="error" />
</div>
```
