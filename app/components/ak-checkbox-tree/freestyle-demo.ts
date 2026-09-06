import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const TREE_DATA = [
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
        ],
      },
      { key: 'Child1.2', label: 'Child 1.2' },
    ],
  },
  {
    key: 'Root2',
    label: 'Root 2',
    children: [
      { key: 'Child2.1', label: 'Child 2.1', disabled: true },
      { key: 'Child2.2', label: 'Child 2.2' },
    ],
  },
];

export default class AkCheckboxTreeFreestyleDemoComponent extends Component {
  treeData = TREE_DATA;
  @tracked expanded = ['Root1', 'Root2'];
  @tracked checked = ['Child1.1.1'];

  @action
  onExpand(expandedItems: string[]) {
    this.expanded = expandedItems;
  }

  @action
  onCheck(checkedItems: string[]) {
    this.checked = checkedItems;
  }
}
