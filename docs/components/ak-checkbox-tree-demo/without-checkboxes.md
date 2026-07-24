---
order: 4
---

# Without checkboxes

Use `showCheckbox: false` on nodes to hide the checkbox but keep expand/collapse on the row (for section headers or purely structural nodes).

```hbs template
<AkCheckboxTree
  @treeData={{this.treeData}}
  @expanded={{this.expanded}}
  @checked={{this.checked}}
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
      key: 'Root4',
      label: 'Root 4',
      showCheckbox: false,
      children: [
        { key: 'Child4.1', label: 'Child 4.1', showCheckbox: false },
        { key: 'Child4.2', label: 'Child 4.2', showCheckbox: false },
      ],
    },
  ];

  @tracked expanded = ['Root4'];
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
