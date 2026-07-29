---
title: AkStack
order: 24
---

# AkStack

Flex layout component for arranging items.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `direction` | string | - | row or column |
| `spacing` | string | - | Gap between items |
| `alignItems` | string | - | align-items value |
| `justifyContent` | string | - | justify-content value |
| `width` | string | - | Width (e.g. full, fit-content) |

## Examples

### Basic

```hbs preview-template
<AkStack
  @spacing="0"
  @direction="row"
  @alignItems="center"
  @justifyContent="space-between"
  @width="fit-content"
  style="border: 1px solid #ff4d3f; padding: 12px;"
>
  <span style="padding: 8px; border: 1px solid #eee;">Item - 1</span>
  <span style="padding: 8px; border: 1px solid #eee;">Item - 2</span>
  <span style="padding: 8px; border: 1px solid #eee;">Item - 3</span>
</AkStack>
```
