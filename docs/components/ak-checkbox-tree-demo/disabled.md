# Disabled Nodes

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
      key: 'Root2',
      label: 'Root 2',
      children: [
        { key: 'Child2.1', label: 'Child 2.1', disabled: true },
        { key: 'Child2.2', label: 'Child 2.2' },
      ],
    },
  ];

  @tracked expanded = ['Root2'];
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
