---
title: AkCheckboxTree
order: 5
manualDemoInsertion: true
---

# AkCheckboxTree

Tree structure with checkboxes for hierarchical selection. Extends AkTree with checkbox support.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `treeData` | array | required | Tree nodes (key, label, children) |
| `expanded` | array | required | Expanded node keys |
| `checked` | array | required | Checked node keys |
| `cascade` | boolean | `true` | Cascade check to children/parents |
| `disabled` | boolean | `false` | Disabled state |
| `onCheck` | function | required | (checkedKeys, node, flatNodes) => void |
| `onExpand` | function | required | (expandedKeys, node, flatNodes) => void |

### Node shape

| Field | Type | Description |
| --- | --- | --- |
| `key` | string | Unique node id |
| `label` | string | Display label |
| `children` | array | Child nodes |
| `expanded` | boolean | Initially expanded |
| `disabled` | boolean | Disabled node |
| `showCheckbox` | boolean | Show checkbox (default true) |

## Blocks

- `default` – (node, tree) – Custom node content (overrides default)
- `label` – Custom label for node

## Examples

[[demos-all]]
