---
title: AkRadio
order: 21
---

# AkRadio

Radio button for single selection. Use with `AkRadio::Group` for grouped radios and `AkFormControlLabel` for labels.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | string \| number | - | Value when selected |
| `radioCtx` | object | - | Context from AkRadio::Group (name, value, handleChange) |
| `checked` | boolean | - | Controlled checked state (standalone) |
| `name` | string | - | Group name (standalone) |
| `disabled` | boolean | `false` | Disabled state |
| `onChange` | function | - | Callback when selection changes |

### AkRadio::Group

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | string | - | Selected value (controlled) |
| `name` | string | auto | Group name |
| `groupDirection` | string | `'column'` | column or row |
| `onChange` | function | - | Callback (event, value) |

## Examples

### Radio Group

```hbs preview-template
<AkRadio::Group @value="a" @groupDirection="column" as |ctx|>
  <AkFormControlLabel @label="Option A" as |fcl|>
    <AkRadio @radioCtx={{ctx}} @value="a" @disabled={{fcl.disabled}} />
  </AkFormControlLabel>
  <AkFormControlLabel @label="Option B" as |fcl|>
    <AkRadio @radioCtx={{ctx}} @value="b" @disabled={{fcl.disabled}} />
  </AkFormControlLabel>
  <AkFormControlLabel @label="Option C (Disabled)" @disabled={{true}} as |fcl|>
    <AkRadio @radioCtx={{ctx}} @value="c" @disabled={{fcl.disabled}} />
  </AkFormControlLabel>
</AkRadio::Group>
```
