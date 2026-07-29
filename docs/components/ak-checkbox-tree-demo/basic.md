# Basic Checkbox Tree

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
      key: 'Root1',
      label: 'Root 1',
      children: [
        {
          key: 'Child1.1',
          label: 'Child 1.1',
          expanded: true,
          children: [
            { key: 'Child1.1.1', label: 'Child 1.1.1' },
            { key: 'Child1.1.2', label: 'Child 1.1.2' },
            { key: 'Child1.1.3', label: 'Child 1.1.3' },
          ],
        },
        { key: 'Child1.2', label: 'Child 1.2' },
      ],
    },
  ];

  @tracked expanded = ['Root1'];
  @tracked checked = ['Child1.1.1'];

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
