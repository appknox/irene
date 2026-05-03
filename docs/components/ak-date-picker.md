---
title: AkDatePicker
order: 9
---

# AkDatePicker

Date picker with calendar. Supports single, range, and multiple date selection. Uses Power Calendar internally.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `selected` | Date \| object | - | Selected date(s) |
| `center` | Date | today | Calendar center date |
| `onSelect` | function | - | (value, calendar, event, close) => void |
| `onCenterChange` | function | - | Center change callback |
| `range` | boolean | `false` | Enable range selection |
| `multiple` | boolean | `false` | Enable multiple selection |
| `closeOnSelect` | boolean | `true` | Close on date select |
| `placement` | string | `'bottom'` | Popover placement |
| `renderInPlace` | boolean | `false` | Render in place |
| `minDate` | Date | - | Minimum selectable date |
| `maxDate` | Date | - | Maximum selectable date |
| `weekdayFormat` | string | `'min'` | min, short, or long |

## Blocks

- `default` – Trigger element (e.g. button or input)

## Examples

Date picker requires a trigger and controlled state. Use `@selected` and `@onSelect` to manage selection.
