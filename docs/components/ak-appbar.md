---
title: AkAppbar
order: 2
---

# AkAppbar

Application bar for top or bottom navigation. Uses AkStack internally. Yields `classes.defaultIconBtn` for icon button styling.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `color` | string | `'inherit'` | inherit, default, light, or dark |
| `elevation` | boolean | `false` | Add bottom elevation shadow |
| `position` | string | `'static'` | static, fixed, relative, absolute, sticky |
| `placement` | string | `'top'` | top or bottom |
| `direction` | string | - | Stack direction (row, column) |
| `alignItems` | string | `'center'` | Stack alignment |
| `justifyContent` | string | - | Stack justify content |
| `gutter` | boolean | `true` | Add gutter padding |
| `spacing` | number | - | Stack spacing |

## Examples

### Basic Appbar

```hbs preview-template
<AkAppbar
  @color="inherit"
  @elevation={{false}}
  @position="static"
  @placement="top"
  @direction="row"
  @alignItems="center"
  @justifyContent="space-between"
  @gutter={{true}}
  @spacing={{0}}
  as |ab|
>
  <AkTypography @variant="h5" @color="inherit">
    Appbar title
  </AkTypography>
  <AkIconButton class={{ab.classes.defaultIconBtn}}>
    <AkIcon @iconName="close" />
  </AkIconButton>
</AkAppbar>
```
