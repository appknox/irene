---
title: AkRadio
order: 21
manualDemoInsertion: true
---

# AkRadio

Radio control for **single choice** in a set. Use **`AkRadio::Group`** so radios share a name and selection state; pair each radio with **`AkFormControlLabel`** for labels and disabled styling on the label.

## API Reference

### `AkRadio`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | string \| number | - | Value of this radio when selected. |
| `radioCtx` | object | - | Hash from `AkRadio::Group` (`name`, `value`, `handleChange`). |
| `checked` | boolean | - | Optional controlled mode without a group (omit when using `radioCtx`). |
| `name` | string | - | Radio `name` when **not** using a group. |
| `id` | string | auto | Input id (default `ak-radio-…`). |
| `disabled` | boolean | `false` | Disables the input. |
| `readonly` | boolean | `false` | Read-only input. |
| `onChange` | function | - | `(event, checked) => void` after change (in addition to `radioCtx.handleChange`). |

### `AkRadio::Group`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | string | - | Selected value (**controlled**). Omit to use internal tracked state only. |
| `name` | string | auto | `name` on each radio (`ak-radio-…` if unset). |
| `groupDirection` | string | `'column'` | `column` or `row` layout. |
| `onChange` | function | - | `(event, value) => void` when selection changes. |

### Block yield (`as |ctx|`)

| Key | Type | Description |
| --- | --- | --- |
| `value` | string | Current group value (pass into radios via `radioCtx`; `AkRadio` compares `value` to its `@value`). |
| `name` | string | Shared `name` for all radios in the group. |
| `handleChange` | function | Invoked by each radio’s `change` handler—do not call manually. |

**Controlled usage:** If you set `@value` on the group, you must update it from **`@onChange`** (e.g. with `@tracked` in the parent). Otherwise the selection will not move when the user clicks another option.

## Examples

[[demos-all]]
