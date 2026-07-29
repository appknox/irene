---
title: AkButton
order: 4
---

# AkButton

The primary button component with support for multiple variants: filled, outlined, and text. Use it for actions, form submissions, and navigation.

## API Reference

| Prop                   | Type    | Default     | Description                                  |
| ---------------------- | ------- | ----------- | -------------------------------------------- |
| `tag`                  | string  | `'button'`  | HTML element: button, a, div, label, or span |
| `variant`              | string  | `'filled'`  | Style variant: filled, outlined, or text     |
| `color`                | string  | `'primary'` | Color theme: primary, secondary, neutral     |
| `disabled`             | boolean | `false`     | Disabled state                               |
| `loading`              | boolean | `false`     | Shows loading spinner                        |
| `type`                 | string  | `'button'`  | Button type: button, reset, or submit        |
| `underline`            | string  | -           | Text variant only: `none`, `always`, `hover` |
| `typographyVariant`    | string  | -           | Text variant only: AkTypography variant      |
| `typographyFontWeight` | string  | -           | Text variant only: typography weight         |

## Examples

### Default

Filled is the default variant (`variant` defaults to `filled`). Outlined styles for secondary actions.

```hbs preview-template
<div style='display: flex; flex-direction: column; gap: 12px;'>
  <AkButton>Filled Primary</AkButton>
  <AkButton @variant='outlined'>Outlined Primary</AkButton>
  <AkButton @color='neutral' @variant='outlined'>Outlined Neutral</AkButton>
</div>
```

### Text

Low-emphasis actions using `variant="text"`. Color and underline follow `AkTypography` args.

```hbs preview-template
<div style='display: flex; flex-direction: column; gap: 12px;'>
  <AkButton @variant='text' @color='primary'>Text Primary</AkButton>
  <AkButton @variant='text' @color='secondary'>Text Secondary</AkButton>
  <AkButton @variant='text' @color='primary' @underline='hover'>Text with hover
    underline</AkButton>
</div>
```

### Disabled

`disabled` applies to every variant.

```hbs preview-template
<div style='display: flex; flex-direction: column; gap: 12px;'>
  <AkButton @disabled={{true}}>Filled Primary</AkButton>
  <AkButton @variant='outlined' @disabled={{true}}>Outlined Primary</AkButton>
  <AkButton @color='neutral' @variant='outlined' @disabled={{true}}>Outlined
    Neutral</AkButton>
  <AkButton @variant='text' @color='primary' @disabled={{true}}>Text Primary</AkButton>
</div>
```

### With icons

`leftIcon` and `rightIcon` named blocks. Icons are hidden while `loading` is true on filled buttons.

```hbs preview-template
<div style='display: flex; flex-wrap: wrap; gap: 12px; align-items: center;'>
  <AkButton>
    <:leftIcon>
      <AkIcon @iconName='delete' />
    </:leftIcon>

    <:default>Delete</:default>
  </AkButton>

  <AkButton @variant='outlined'>
    <:leftIcon>
      <AkIcon @iconName='note-add' />
    </:leftIcon>

    <:default>Add Note</:default>
  </AkButton>

  <AkButton @color='neutral' @variant='outlined'>
    <:leftIcon>
      <AkIcon @iconName='refresh' />
    </:leftIcon>

    <:default>Refresh</:default>
  </AkButton>

  <AkButton @variant='text' @color='primary'>
    <:leftIcon>
      <AkIcon @iconName='open-in-new' />
    </:leftIcon>

    <:default>Open link</:default>
  </AkButton>
</div>
```

### Loading

The loading spinner is shown for **filled** buttons only (`loading` is ignored for `outlined` and `text`).

```hbs preview-template
<div style='display: flex; flex-direction: column; gap: 12px;'>
  <AkButton @loading={{true}}>Loading Button</AkButton>
</div>
```
