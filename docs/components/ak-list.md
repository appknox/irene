---
title: AkList
order: 15
---

# AkList

List container. Use with AkList::Item for list items with optional icons and actions.

## API Reference

AkList yields context for `listItem` component. Each item can have `leftIcon`, `rightIcon`, and `text` blocks.

## Examples

### Basic List

```hbs preview-template
<AkList as |akl|>
  <akl.listItem as |li|>
    <li.leftIcon>
      <AkIcon @iconName="folder" />
    </li.leftIcon>
    <li.text @primaryText="Projects" />
  </akl.listItem>
  <akl.listItem as |li|>
    <li.leftIcon>
      <AkIcon @iconName="group" />
    </li.leftIcon>
    <li.text @primaryText="Organization" />
  </akl.listItem>
  <akl.listItem as |li|>
    <li.leftIcon>
      <AkIcon @iconName="account-box" />
    </li.leftIcon>
    <li.text @primaryText="Settings" />
  </akl.listItem>
</AkList>
```
