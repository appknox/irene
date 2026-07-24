---
title: AkAutocomplete
order: 3
manualDemoInsertion: true
---

# AkAutocomplete

Searchable dropdown with text input. Filters options as user types. Uses AkTextField and AkPopover internally.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `searchQuery` | string | required | Current search value |
| `options` | array | required | Options (strings or objects) |
| `onChange` | function | required | (searchQuery, event) => void |
| `onSelect` | function | - | Optional callback on option select |
| `onClear` | function | - | Optional callback on clear |
| `filterKey` | string | `'label'` | Key for object options |
| `filterFn` | function | - | Custom filter (requires setInputValueFn) |
| `setInputValueFn` | function | - | Required with filterFn |
| `label` | string | - | Input label |
| `placeholder` | string | `'Type here...'` | Input placeholder |
| `disabled` | boolean | `false` | Disabled state |
| `loading` | boolean | `false` | Show loading state |
| `renderInPlace` | boolean | `false` | Render dropdown in place |

## Blocks

- `default` – Custom option template (yields option)
- `loading` – Custom loading template
- `empty` – Custom empty state template

## Examples

[[demos-all]]
