---
title: AkLoader
order: 16
---

# AkLoader

Loading spinner. Supports circular (default) and linear variants.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | string | `'indeterminate'` | indeterminate or determinate |
| `size` | number | - | Size in px (circular) |
| `thickness` | number | - | Stroke thickness (circular) |
| `progress` | number | - | Progress 0-100 (determinate) |
| `color` | string | - | primary, etc. |

## Blocks

- `label` – Label content

## Examples

### Circular (Default)

```hbs preview-template
<AkLoader @size={{100}} @thickness={{3}} @color="primary" />
```

### Circular with Label

```hbs preview-template
<AkLoader @size={{100}} @thickness={{3}} @color="primary">
  <:label>
    <AkTypography @variant="h6">Loading...</AkTypography>
  </:label>
</AkLoader>
```

### Determinate Circular

```hbs preview-template
<AkLoader @variant="determinate" @size={{100}} @thickness={{3}} @progress={{22.5}} @color="primary" />
```

### Linear Loader

```hbs preview-template
<div style="width: 50%;">
  <AkLoader::Linear @variant="determinate" @height={{4}} @progress={{22.5}} @color="primary">
    <:label>
      <AkTypography @variant="h6">22.5%</AkTypography>
    </:label>
  </AkLoader::Linear>
  <AkDivider />
  <AkLoader::Linear @height={{4}} @color="primary" />
</div>
```
