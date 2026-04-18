---
title: AkTabs
order: 26
manualDemoInsertion: true
---

# AkTabs

Tabbed navigation. Use AkTabs with Akt.tabItem for each tab.

## API Reference

### AkTabs

Yields `tabItem` component.

### AkTabs::Item (tabItem)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | any | required | Tab identifier |
| `isActive` | boolean | `false` | Whether tab is active |
| `onTabClick` | function | - | (tabId) => void |
| `buttonVariant` | boolean | `true` | Use button style (false = link) |
| `hidden` | boolean | `false` | Hide tab |
| `hasBadge` | boolean | `false` | Show badge |
| `badgeCount` | number | - | Badge count |
| `indicatorVariant` | string | - | line, shadow, etc. |

## Blocks

- `default` – Tab label
- `tabIcon` – Tab icon
- `badge` – Custom badge content

## Examples

[[demos-all]]
