---
title: AkTypography
order: 31
---

# AkTypography

Typography component for consistent text styling. Supports variants, colors, and font weights.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tag` | string | auto | HTML element to render |
| `variant` | string | `'body1'` | h1-h6, subtitle1-2, body1-3 |
| `color` | string | - | textPrimary, textSecondary, primary, etc. |
| `fontWeight` | string | - | light, regular, medium, bold |
| `gutterBottom` | boolean | `false` | Add bottom margin |
| `noWrap` | boolean | `false` | Prevent text wrapping (truncate) |
| `underline` | string | `'none'` | none, always, or hover |

## Examples

### Default

```hbs preview-template
<AkTypography @color="textSecondary" @gutterBottom={{true}}>Experiment with me</AkTypography>
<AkTypography @tag="" @variant="h4" @color="" @gutterBottom={{false}} @noWrap={{false}} @underline="none">
  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
</AkTypography>
```

### All Variants

```hbs preview-template
<div style="display: flex; flex-direction: column; gap: 4px;">
  <AkTypography @variant="h1" @gutterBottom={{true}}>This is heading 1</AkTypography>
  <AkTypography @variant="h2" @gutterBottom={{true}}>This is heading 2</AkTypography>
  <AkTypography @variant="h3" @gutterBottom={{true}}>This is heading 3</AkTypography>
  <AkTypography @variant="h4" @gutterBottom={{true}}>This is heading 4</AkTypography>
  <AkTypography @variant="h5" @gutterBottom={{true}}>This is heading 5</AkTypography>
  <AkTypography @variant="h6" @gutterBottom={{true}}>This is heading 6</AkTypography>
  <AkTypography @variant="subtitle1" @gutterBottom={{true}}>This is subtitle 1</AkTypography>
  <AkTypography @variant="subtitle2" @gutterBottom={{true}}>This is subtitle 2</AkTypography>
  <AkTypography @variant="body1" @gutterBottom={{true}}>Body 1 - Lorem Ipsum is simply dummy text...</AkTypography>
  <AkTypography @variant="body2" @gutterBottom={{true}}>Body 2 - Lorem Ipsum is simply dummy text...</AkTypography>
  <AkTypography @variant="body3" @gutterBottom={{true}}>Body 3 - Lorem Ipsum is simply dummy text...</AkTypography>
</div>
```

### Truncated (noWrap)

```hbs preview-template
<AkTypography @color="textSecondary" @gutterBottom={{true}}>Big line</AkTypography>
<AkTypography @variant="body1" @noWrap={{true}} style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">
  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
</AkTypography>
```
