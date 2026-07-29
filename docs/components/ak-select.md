---
title: AkSelect
order: 22
manualDemoInsertion: true
---

# AkSelect

Dropdown select based on ember-power-select. Supports single and multiple selection, search.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | array | required | Select options |
| `selected` | any | - | Selected value(s) |
| `onChange` | function | - | (selection) => void |
| `placeholder` | string | - | Placeholder text |
| `label` | string | - | Label |
| `disabled` | boolean | `false` | Disabled state |
| `searchEnabled` | boolean | `false` | Enable search |
| `multiple` | boolean | `false` | Multiple selection |
| `renderInPlace` | boolean | `false` | Render dropdown in place |
| `noMatchesMessage` | string | - | No results message |
| `loadingMessage` | string | - | Loading message |
| `error` | boolean | `false` | Error state |
| `helperText` | string | - | Helper text |

## Blocks

- `default` – Option template (yields option, select)

## Examples

[[demos-all]]
