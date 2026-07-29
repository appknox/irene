---
title: AkAccordion
order: 1
manualDemoInsertion: true
---

# AkAccordion

Expandable/collapsible content panel. Use with AkAccordion::Group for multiple accordions, or standalone with `@isExpanded` and `@onChange`.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string | auto | Unique id (required in group) |
| `summaryText` | string | - | Text shown in header |
| `summaryIconName` | string | - | Icon name for header |
| `variant` | string | `'secondary'` | primary, secondary, or light |
| `disabled` | boolean | `false` | Disabled state |
| `isExpanded` | boolean | - | Controlled expanded state (standalone) |
| `onChange` | function | - | Callback when toggled (id) => void |
| `accordionCtx` | object | - | Context from AkAccordion::Group |
| `mountContentOnExpand` | boolean | `false` | Lazy mount content on first expand |
| `unmountContentOnCollapse` | boolean | `false` | Unmount on collapse |

## Blocks

- `content` – Accordion body content
- `summary` – Custom summary (yields onSummaryClick, disabled, isExpanded)
- `summaryIcon` – Custom summary icon
- `summaryText` – Custom summary text

## Examples

[[demos-all]]
