---
title: AkSkeleton
order: 23
---

# AkSkeleton

Placeholder loading animation. Supports circular, rectangular, and rounded variants.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | string | - | Width (e.g. 60px, 250px) |
| `height` | string | - | Height |
| `variant` | string | - | circular, rectangular, or rounded |
| `tag` | string | `'span'` | HTML tag |

## Examples

### Variants

```hbs preview-template
<AkStack @direction="column" @spacing="1">
  <AkSkeleton @width="60px" @height="60px" @variant="circular" />
  <AkSkeleton @width="250px" @height="20px" />
  <AkSkeleton @width="250px" @height="20px" @variant="rectangular" />
  <AkSkeleton @width="250px" @height="20px" @variant="rounded" />
</AkStack>
```
