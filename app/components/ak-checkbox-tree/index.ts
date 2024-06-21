import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';

export default class AkCheckboxTreeComponent extends Component {
  @tracked treeData = [
    {
      key: 'Root1',
      label: 'Root 1',
      children: [
        {
          key: 'Child1.1',
          label: 'Child 1.1',

          children: [
            {
              key: 'Child1.1.1',
              label: 'Child 1.1.1',
              disabled: true,
              children: [
                {
                  key: 'Child1.1.1.1',
                  label: 'Child 1.1.1.1',
                },
                {
                  key: 'Child1.1.1.2',
                  label: 'Child 1.1.1.2',
                },
              ],
            },
            {
              key: 'Child1.1.2',
              label: 'Child 1.1.2',
            },
            {
              key: 'Child1.1.3',
              label: 'Child 1.1.3',
            },
          ],
        },
        {
          key: 'Child1.2',
          label: 'Child 1.2',
        },
      ],
    },
    {
      key: 'Root2',
      label: 'Root 2',
      children: [
        { key: 'Child2.1', label: 'Child 2.1' },
        { key: 'Child2.2', label: 'Child 2.2' },
      ],
    },
  ];

  @tracked expanded: string[] = ['Root2', 'Root1', 'Child1.1'];
  @tracked checked: string[] = ['Child2.1', 'Child1.2'];

  @action onCheck(checkedItems: Array<string>) {
    this.checked = checkedItems;
  }

  @action onExpand(expandedItems: Array<string>) {
    this.expanded = expandedItems;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkCheckboxTree: typeof AkCheckboxTreeComponent;
  }
}
