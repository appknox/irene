import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkCheckboxTree',
  component: 'ak-checkbox-tree',
  excludeStories: [],
};

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
          {
            key: 'Child1.1.1',
            label: 'Child 1.1.1',
            children: [
              {
                key: 'Child1.1.1.1',
                label: 'Child 1.1.1.1',
                children: [
                  {
                    key: 'Child1.1.1.1.1',
                    label: 'Child 1.1.1.1.1',
                  },
                  {
                    key: 'Child1.1.1.1.2',
                    label: 'Child 1.1.1.1.2',
                  },
                ],
              },
              {
                key: 'Child1.1.1.2',
                label: 'Child 1.1.1.2',
                children: [
                  {
                    key: 'Child1.1.1.2.1',
                    label: 'Child 1.1.1.1.1',
                  },
                  {
                    key: 'Child1.1.1.2.2',
                    label: 'Child 1.1.1.1.2',
                  },
                ],
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
      { key: 'Child2.1', label: 'Child 2.1', disabled: true },
      { key: 'Child2.2', label: 'Child 2.2' },
    ],
  },
  {
    key: 'Root3',
    label: 'Root 3',
    children: [
      { key: 'Child3.1', label: 'Child 3.1' },
      { key: 'Child3.2', label: 'Child 3.2' },
    ],
  },
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

function onExpand(expandedItems) {
  this.set('expanded', expandedItems);
}

function onCheck(checkedItems) {
  this.set('checked', checkedItems);
}

const Template = (args) => ({
  template: hbs`
    <AkCheckboxTree
      @treeData={{this.treeData}}
      @expanded={{this.expanded}}
      @cascade={{this.cascade}}
      @checked={{this.checked}}
      @onCheck={{this.onCheck}}
      @onExpand={{this.onExpand}}
    />
  `,
  context: {
    ...args,
    onCheck: action(onCheck),
    onExpand: action(onExpand),
  },
});

export const Basic = Template.bind({});

Basic.args = {
  treeData: TREE_DATA.slice(0, 1),
  expanded: ['Root1'],
  checked: ['Child1.1.1'],
};

export const Disabled = Template.bind({});

Disabled.args = {
  treeData: TREE_DATA.slice(1, 2),
  expanded: ['Root2'],
  checked: [],
};

export const NoCascade = Template.bind({});

NoCascade.args = {
  treeData: TREE_DATA.slice(2, 3),
  expanded: ['Root3'],
  cascade: false,
  checked: [],
};

export const WithoutCheckboxes = Template.bind({});

WithoutCheckboxes.args = {
  treeData: TREE_DATA.slice(-1),
  expanded: ['Root4'],
  checked: [],
};
