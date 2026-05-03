---
title: AkIconButton
order: 12
---

# AkIconButton

Button that displays only an icon. Used for compact actions like delete, edit, menu.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | string | `'default'` | default or outlined |
| `size` | string | `'medium'` | medium or small |
| `borderColor` | string | `'default'` | default, primary, or secondary |
| `type` | string | `'button'` | button, submit, or reset |

## Examples

Icon content goes in the default block.

### Default

```hbs preview-template
<div style="display: flex; gap: 12px;">
  <AkIconButton @type="button" @size="medium">
    <AkIcon @iconName="close" />
  </AkIconButton>
  <AkIconButton @variant="outlined" @size="medium">
    <AkIcon @iconName="refresh" />
  </AkIconButton>
</div>
```

### Variants

```hbs preview-template
<div style="display: flex; gap: 12px;">
  <AkIconButton>
    <AkIcon @iconName="delete" />
  </AkIconButton>
  <AkIconButton @variant="outlined">
    <AkIcon @iconName="refresh" />
  </AkIconButton>
</div>
```

### Sizes

```hbs preview-template
<div style="display: flex; gap: 16px; align-items: center;">
  <AkIconButton @size="small">
    <AkIcon @iconName="delete" />
  </AkIconButton>
  <AkIconButton>
    <AkIcon @iconName="delete" />
  </AkIconButton>
  <AkIconButton @variant="outlined" @size="small">
    <AkIcon @iconName="delete" />
  </AkIconButton>
  <AkIconButton @variant="outlined">
    <AkIcon @iconName="delete" />
  </AkIconButton>
</div>
```

### Disabled

```hbs preview-template
<div style="display: flex; gap: 12px;">
  <AkIconButton disabled={{true}}>
    <AkIcon @iconName="delete" />
  </AkIconButton>
  <AkIconButton disabled={{true}} @variant="outlined">
    <AkIcon @iconName="refresh" />
  </AkIconButton>
</div>
```

### Colors

```hbs preview-template
<div style="display: flex; gap: 16px; flex-wrap: wrap;">
  <AkIconButton>
    <AkIcon @iconName="refresh" />
  </AkIconButton>
  <AkIconButton>
    <AkIcon @color="success" @iconName="done" />
  </AkIconButton>
  <AkIconButton>
    <AkIcon @color="error" @iconName="delete" />
  </AkIconButton>
  <AkIconButton @variant="outlined">
    <AkIcon @iconName="refresh" />
  </AkIconButton>
  <AkIconButton @variant="outlined">
    <AkIcon @color="success" @iconName="done" />
  </AkIconButton>
  <AkIconButton @variant="outlined" @color="danger">
    <AkIcon @color="error" @iconName="delete" />
  </AkIconButton>
</div>
```
