---
title: AkLink
order: 14
---

# AkLink

Link component with support for icons and color variants.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `color` | string | `'textPrimary'` | textPrimary, textSecondary, primary, secondary |
| `underline` | string | `'hover'` | none, hover, or always |
| `disabled` | boolean | `false` | Disabled state |
| `title` | string | - | Title attribute |

## Blocks

- `default` – Link text
- `leftIcon` – Icon before text
- `rightIcon` – Icon after text

## Examples

### Default

```hbs preview-template
<AkLink @underline="hover" @color="textPrimary">
  <:leftIcon>
    <AkIcon @iconName="arrow-back" />
  </:leftIcon>
  <:default>Link</:default>
</AkLink>
```

### Colors

```hbs preview-template
<div style="display: flex; gap: 12px; flex-wrap: wrap;">
  <AkLink>Text primary</AkLink>
  <AkLink @color="textSecondary">Text secondary</AkLink>
  <AkLink @color="primary">Primary</AkLink>
  <AkLink @color="secondary">Secondary</AkLink>
</div>
```

### With Icons

```hbs preview-template
<div style="display: flex; gap: 12px; flex-wrap: wrap;">
  <AkLink>
    <:leftIcon><AkIcon @iconName="arrow-back" /></:leftIcon>
    <:default>Back</:default>
  </AkLink>
  <AkLink @color="primary">
    <:leftIcon><AkIcon @iconName="arrow-back" /></:leftIcon>
    <:default>Back</:default>
  </AkLink>
</div>
```

### Underline

```hbs preview-template
<div style="display: flex; gap: 12px; flex-wrap: wrap;">
  <AkLink @underline="none">Text primary</AkLink>
  <AkLink @underline="hover" @color="primary">Primary</AkLink>
  <AkLink @underline="always" @color="secondary">Secondary</AkLink>
</div>
```

### Disabled

```hbs preview-template
<div style="display: flex; gap: 12px;">
  <AkLink @disabled={{true}}>Text primary</AkLink>
  <AkLink @color="primary" @disabled={{true}}>Primary</AkLink>
</div>
```
