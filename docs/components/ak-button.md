---
title: AkButton
order: 4
---

# AkButton

The primary button component with support for multiple variants: filled, outlined, and text. Use it for actions, form submissions, and navigation.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tag` | string | `'button'` | HTML element: button, a, div, label, or span |
| `variant` | string | `'filled'` | Style variant: filled, outlined, or text |
| `color` | string | `'primary'` | Color theme: primary, secondary, neutral |
| `disabled` | boolean | `false` | Disabled state |
| `loading` | boolean | `false` | Shows loading spinner |
| `type` | string | `'button'` | Button type: button, reset, or submit |

## Examples

### Basic Variants

```hbs preview-template
<div style="display: flex; flex-direction: column; gap: 12px;">
  <AkButton>Filled Primary</AkButton>
  <AkButton @variant="outlined">Outlined Primary</AkButton>
  <AkButton @color="neutral" @variant="outlined">Outlined Neutral</AkButton>
  <AkButton @variant="text">Text Primary</AkButton>
</div>
```

### Disabled State

```hbs preview-template
<div style="display: flex; flex-direction: column; gap: 12px;">
  <AkButton @disabled={{true}}>Filled Primary</AkButton>
  <AkButton @variant="outlined" @disabled={{true}}>Outlined Primary</AkButton>
  <AkButton @variant="text" @disabled={{true}}>Text Primary</AkButton>
</div>
```

### With Icons

```hbs preview-template
<div style="display: flex; flex-wrap: wrap; gap: 12px;">
  <AkButton>
    <:leftIcon>
      <AkIcon @iconName="delete" />
    </:leftIcon>
    <:default>Delete</:default>
  </AkButton>
  <AkButton @variant="outlined">
    <:leftIcon>
      <AkIcon @iconName="note-add" />
    </:leftIcon>
    <:default>Add Note</:default>
  </AkButton>
  <AkButton @color="neutral" @variant="outlined">
    <:leftIcon>
      <AkIcon @iconName="refresh" />
    </:leftIcon>
    <:default>Refresh</:default>
  </AkButton>
</div>
```

### Loading State

```hbs preview-template
<div style="display: flex; flex-direction: column; gap: 12px;">
  <AkButton @loading={{true}}>Loading Button</AkButton>
</div>
```
