---
title: AkCheckbox
order: 6
---

# AkCheckbox

Checkbox input for boolean selections. Use with AkFormControlLabel for labels.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | boolean | `false` | Checked state |
| `indeterminate` | boolean | `false` | Indeterminate state (e.g. "select all") |
| `disabled` | boolean | `false` | Disabled state |
| `readonly` | boolean | `false` | Read-only state |
| `onChange` | function | - | (event, checked) => void |
| `onClick` | function | - | (event) => void |

## Examples

### Basic States

```hbs preview-template
<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; align-items: center; gap: 8px;">
    <AkCheckbox @checked={{false}} />
    <AkTypography>Unchecked</AkTypography>
  </div>
  <div style="display: flex; align-items: center; gap: 8px;">
    <AkCheckbox @checked={{true}} />
    <AkTypography>Checked</AkTypography>
  </div>
  <div style="display: flex; align-items: center; gap: 8px;">
    <AkCheckbox @indeterminate={{true}} />
    <AkTypography>Indeterminate</AkTypography>
  </div>
  <div style="display: flex; align-items: center; gap: 8px;">
    <AkCheckbox @disabled={{true}} />
    <AkTypography>Disabled</AkTypography>
  </div>
  <div style="display: flex; align-items: center; gap: 8px;">
    <AkCheckbox @readonly={{true}} @checked={{true}} />
    <AkTypography>Readonly</AkTypography>
  </div>
</div>
```

### With Label

```hbs preview-template
<AkFormControlLabel @label="Check me" @disabled={{false}} as |fcl|>
  <AkCheckbox @checked={{true}} @disabled={{fcl.disabled}} />
</AkFormControlLabel>
```
