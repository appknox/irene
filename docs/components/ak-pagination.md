---
title: AkPagination
order: 19
---

# AkPagination

Pagination controls with prev/next buttons and items-per-page selector.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disablePrev` | boolean | `false` | Disable previous button |
| `disableNext` | boolean | `false` | Disable next button |
| `totalItems` | number | - | Total item count |
| `startItemIdx` | number | - | Start index (1-based) |
| `endItemIdx` | number | - | End index |
| `itemPerPageOptions` | array | required | Options for per-page selector |
| `selectedOption` | object | - | Currently selected option |
| `onItemPerPageChange` | function | - | Callback when per-page changes |
| `nextAction` | function | - | Next page callback |
| `prevAction` | function | - | Previous page callback |
| `variant` | string | `'default'` | default or compact |
| `tableItemLabel` | string | - | Label for items (e.g. "rows") |

## Examples

Typically used with AkPaginationProvider which yields pagination state and actions.
