---
title: AkDivider
order: 10
---

# AkDivider

A thin line that separates content. Can be horizontal or vertical.

## API Reference

| Prop        | Type   | Default        | Description                       |
| ----------- | ------ | -------------- | --------------------------------- |
| `tag`       | string | -              | HTML tag (e.g. li for list items) |
| `variant`   | string | -              | fullWidth or middle               |
| `color`     | string | -              | light or dark                     |
| `direction` | string | `'horizontal'` | horizontal or vertical            |
| `height`    | string | -              | Height for vertical divider       |
| `width`     | string | -              | Width for horizontal divider      |

## Examples

### Horizontal (in list)

```hbs preview-template
<div style='width: 50%; background: #fff; padding: 16px;'>
  <AkList as |akl|>
    <akl.listItem as |li|>
      <li.leftIcon><AkIcon @iconName='folder' /></li.leftIcon>

      <li.text @primaryText='Projects' />
    </akl.listItem>

    <AkDivider @tag='li' @variant='fullWidth' @color='dark' />

    <akl.listItem as |li|>
      <li.leftIcon>
        <AkIcon @iconName='inventory-2' />
      </li.leftIcon>

      <li.text @primaryText='Store Monitoring' />
    </akl.listItem>

    <AkDivider @tag='li' @variant='fullWidth' @color='dark' />

    <akl.listItem as |li|>
      <li.leftIcon>
        <AkIcon @iconName='account-box' />
      </li.leftIcon>

      <li.text @primaryText='Settings' />
    </akl.listItem>
  </AkList>
</div>
```

### Vertical

```hbs preview-template
<div
  style='display: flex; align-items: center; justify-content: space-around; padding: 24px;'
>
  <AkTypography @color='textSecondary'>A</AkTypography>

  <AkDivider
    @height='200px'
    @width='1px'
    @color='dark'
    @direction='vertical'
    @variant='fullWidth'
  />

  <AkTypography @color='textSecondary'>B</AkTypography>
</div>
```
