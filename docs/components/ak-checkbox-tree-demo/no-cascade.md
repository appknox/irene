---
order: 3
---

# No cascade

When `@cascade={{false}}`, checking a node does not auto-check ancestors or descendants.

```hbs template
<AkCheckboxTree
  @treeData={{this.treeData}}
  @expanded={{this.expanded}}
  @checked={{this.checked}}
  @cascade={{false}}
  @onCheck={{this.onCheck}}
  @onExpand={{this.onExpand}}
/>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  treeData = [
    {
      key: 'Root3',
      label: 'Root 3',
      children: [
        { key: 'Child3.1', label: 'Child 3.1' },
        { key: 'Child3.2', label: 'Child 3.2' },
      ],
    },
  ];

  @tracked expanded = ['Root3'];
  @tracked checked = [];

  @action
  onCheck(checkedKeys) {
    this.checked = checkedKeys;
  }

  @action
  onExpand(expandedKeys) {
    this.expanded = expandedKeys;
  }
}
```
