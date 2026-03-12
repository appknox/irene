---
title: AkTextField
order: 27
manualDemoInsertion: true
---

# AkTextField

Text input field with label, placeholder, helper text, and adornments.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | - | Field label |
| `placeholder` | string | - | Placeholder text |
| `value` | string | - | Input value |
| `type` | string | `'text'` | Input type (text, password, etc.) |
| `disabled` | boolean | `false` | Disabled state |
| `readonly` | boolean | `false` | Read-only state |
| `required` | boolean | `false` | Required field |
| `error` | boolean | `false` | Error state |
| `helperText` | string | - | Helper text below field |
| `autofocus` | boolean | `false` | Autofocus on mount |

## Blocks

- `leftAdornment` – Content before input
- `rightAdornment` – Content after input
- `helperText` – Custom helper text

## Examples

### Basic

```hbs preview-template
<AkTextField
  @label="Experiment with me"
  @placeholder="Enter something"
  @value=""
  @helperText=""
  @disabled={{false}}
  @readonly={{false}}
  @error={{false}}
  @required={{false}}
/>
```

### Without Label

```hbs preview-template
<div style="display: flex; gap: 12px;">
  <AkTextField @placeholder="Without label" />
  <AkTextField @placeholder="Without label has value" @value="Hello world" />
</div>
```

### Helper Text

```hbs preview-template
<div style="display: flex; gap: 12px; flex-wrap: wrap;">
  <AkTextField @label="Helper Text" @placeholder="Enter something" @helperText="I am an helper text" />
  <AkTextField @label="Helper Text Error State" @placeholder="Enter something" @helperText="I am an helper text in error state" @error={{true}} />
</div>
```

### Disabled & Readonly

```hbs preview-template
<div style="display: flex; gap: 12px; flex-wrap: wrap;">
  <AkTextField @label="Disabled" @placeholder="Enter something" @disabled={{true}} />
  <AkTextField @label="Disabled with value" @placeholder="Enter something" @value="I am disabled" @disabled={{true}} />
  <AkTextField @label="Readonly" @placeholder="Enter something" @readonly={{true}} />
  <AkTextField @label="Readonly with value" @placeholder="Enter something" @value="I am readonly" @readonly={{true}} />
</div>
```

### Required & Password

```hbs preview-template
<div style="display: flex; gap: 12px;">
  <AkTextField @label="Required" @placeholder="Enter something" @required={{true}} />
  <AkTextField @label="Password" @placeholder="Enter password" @type="password" />
</div>
```

### With Icon (Adornments)

```hbs preview-template
<AkTextField @label="Experiment with me" @placeholder="Enter something">
  <:leftAdornment>
    <span class="ak-icon ak-icon-credit-card"></span>
  </:leftAdornment>
  <:rightAdornment>
    <span class="ak-icon ak-icon-close"></span>
  </:rightAdornment>
</AkTextField>
<div style="display: flex; gap: 12px; margin-top: 12px;">
  <AkTextField @placeholder="Only left adornment">
    <:leftAdornment><span>$</span></:leftAdornment>
  </AkTextField>
  <AkTextField @value="Only right adornment">
    <:rightAdornment>
      <span class="ak-icon ak-icon-close"></span>
    </:rightAdornment>
  </AkTextField>
</div>
```

### With Event

[[demo:with-event]]
