---
title: AkTable
order: 25
manualDemoInsertion: true
---

# AkTable

Wrapper around **`ember-table`**’s `EmberTable` with Appknox styling: header color, **semi-bordered** or **full-bordered** layout, border tone, optional row hover, and density.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | string | `'semi-bordered'` | `semi-bordered` (row dividers) or `full-bordered` (all cell borders). |
| `headerColor` | string | `'neutral'` | Header background: `neutral`, `transparent`, etc. |
| `borderColor` | string | `'light'` | Cell / rule color: `light` or `dark`. |
| `hoverable` | boolean | `false` | Highlight row on hover. |
| `dense` | boolean | `false` | Tighter cell padding. |

## Blocks

Yield **`t`** from `ember-table`: use **`t.head`** with **`@columns`** and **`t.body`** with **`@rows`**. Column definitions use **`name`** and **`valuePath`**; cells receive each column’s value via **`r.cell as |value|`**.

## Examples

Order: **Default (semi-bordered)** → **Full bordered**.

[[demos-all]]
