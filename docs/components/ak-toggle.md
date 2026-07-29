---
title: AkToggle
order: 28
---

# AkToggle

Toggle switch for on/off states. Use with AkFormControlLabel for labels.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | boolean | `false` | Checked/on state |
| `size` | string | - | small, medium, or large |
| `disabled` | boolean | `false` | Disabled state |
| `readonly` | boolean | `false` | Read-only state |
| `onChange` | function | - | (event, checked) => void |
| `onClick` | function | - | (event) => void |

## Examples

### Basic

```hbs preview-template
<div style="display: flex; flex-direction: column; gap: 16px;">
  <div style="display: flex; align-items: center; gap: 12px;">
    <AkToggle @checked={{false}} @size="small" />
    <AkTypography>Off</AkTypography>
  </div>
  <div style="display: flex; align-items: center; gap: 12px;">
    <AkToggle @checked={{true}} @size="small" />
    <AkTypography>On</AkTypography>
  </div>
  <div style="display: flex; align-items: center; gap: 12px;">
    <AkToggle @disabled={{true}} @size="small" />
    <AkTypography>Disabled</AkTypography>
  </div>
</div>
```

### With Label

```hbs preview-template
<AkFormControlLabel @label="Check me" @disabled={{false}} as |fcl|>
  <AkToggle @checked={{true}} @size="small" @disabled={{fcl.disabled}} />
</AkFormControlLabel>
```

### Sizes

```hbs preview-template
<div style="display: flex; gap: 24px; align-items: center;">
  <AkToggle @checked={{false}} @size="small" />
  <AkToggle @checked={{false}} />
  <AkToggle @checked={{false}} @size="large" />
</div>
```
