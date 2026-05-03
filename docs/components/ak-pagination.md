---
title: AkPagination
order: 19
manualDemoInsertion: true
---

# AkPagination

Pagination bar: items-per-page `AkSelect`, range text (`start–end of total label`), and prev/next `AkButton`s. **`AkPaginationProvider`** owns derived state (`disablePrev`, `disableNext`, `startItemIdx`, `endItemIdx`, `currentPageResults`, etc.); your app owns **`offset`**, **`limit`** (via `defaultLimit` + callbacks) and must pass **`results`** already **sliced** for the current page.

## API Reference — `AkPagination`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `itemPerPageOptions` | array | required | Options passed through to `AkSelect` (from provider). |
| `selectedOption` | object | - | Selected per-page option (from provider). |
| `onItemPerPageChange` | function | - | Forwards to `AkSelect` `@onChange`. |
| `totalItems` | number | - | Total count (shows range when set). |
| `startItemIdx` | number | - | Start of range (1-based display). |
| `endItemIdx` | number | - | End of range. |
| `tableItemLabel` | string | - | Noun after the total (e.g. `"Projects"`). |
| `perPageTranslation` | string | - | Label before the page-size select. |
| `prevBtnLabel` | string | - | Prev button label (`default` variant only; else i18n `previous`). |
| `nextBtnLabel` | string | - | Next button label (`default` variant only; else i18n `next`). |
| `disablePrev` | boolean | `false` | Disable previous. |
| `disableNext` | boolean | `false` | Disable next. |
| `prevAction` | function | - | Prev click handler. |
| `nextAction` | function | - | Next click handler. |
| `variant` | string | `'default'` | `default` or `compact` (icons only on nav buttons). |
| `paginationSelectOptionsVertPosition` | string | - | `AkSelect` vertical position: `above`, `below`, or `auto`. |

## `AkPaginationProvider` (required wiring)

Typical arguments:

| Prop | Description |
| --- | --- |
| `results` | Current page rows (slice of your full dataset). |
| `totalItems` | Full dataset size. |
| `offset` | Zero-based start index in the full dataset. |
| `defaultLimit` | Page size (must stay in sync with parent `limit`). |
| `itemPerPageOptions` | Numbers, e.g. `[5, 10, 15]`. |
| `onItemPerPageChange` | Receives `{ limit, offset }` (offset reset when page size changes). |
| `nextAction` / `prevAction` | Receives `{ limit, offset }` for the new page. |

Yielded **`pgc`** includes: `currentPageResults`, `itemPerPageOptions`, `selectedOption`, `onItemPerPageChange`, `nextAction`, `prevAction`, `disableNext`, `disablePrev`, `startItemIdx`, `endItemIdx`, `totalItems`.

## Examples

Stories are mirrored here in order: **Basic** → **Compact** → **Custom UI (provider only)**.

[[demos-all]]
