---
title: AkTree
order: 30
---

# AkTree

Tree view for hierarchical data. Supports expand/collapse and optional checkboxes.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `treeData` | array | required | Tree nodes (key, label, children) |
| `expanded` | array | required | Expanded node keys |
| `checked` | array | required | Checked node keys |
| `cascade` | boolean | `false` | Cascade check to children |
| `disabled` | boolean | `false` | Disabled state |
| `onCheck` | function | required | (keys, node, flatNodes) => void |
| `onExpand` | function | required | (keys, node, flatNodes) => void |

### Node shape

| Field | Type | Description |
| --- | --- | --- |
| `key` | string | Unique node id |
| `label` | string | Display label |
| `children` | array | Child nodes |
| `checked` | boolean | Checked state |
| `expanded` | boolean | Expanded state |
| `showCheckbox` | boolean | Show checkbox |
| `disabled` | boolean | Disabled |

## Blocks

- `default` – (node, tree) – Node content and tree actions (getFlatNode, onExpand, onCheck)

## Examples

Requires tree data structure and controlled state for expanded/checked. Use with AkTreeProvider-style configuration.
