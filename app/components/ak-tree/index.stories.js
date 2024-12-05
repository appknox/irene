import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkTree',
  component: 'ak-tree',
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

const actions = {
  calculatePadding(treeDepth) {
    return `${(treeDepth + 1) * 0.9286}em`;
  },
};

function onExpand(expandedItems) {
  this.set('expanded', expandedItems);
}

function onCheck(checkedItems) {
  this.set('checked', checkedItems);
}

const Template = (args) => ({
  template: hbs`
    <AkTree
      @treeData={{this.treeData}}
      @expanded={{this.expanded}}
      @cascade={{this.cascade}}
      @checked={{this.checked}}
      @onCheck={{this.onCheck}}
      @onExpand={{this.onExpand}}
      as |node tree|
    >
      <AkStack @alignItems="center" {{style paddingLeft=(this.calculatePadding node.treeDepth)}}>
        {{#if node.isParent}}
          <AkIcon
            @iconName='arrow-drop-down'
            @color='secondary'
            {{style cursor="pointer"}}
            {{on 'click' (fn tree.onExpand node)}}
          />
        {{/if}}

        <div 
          class="pl-1 py-1" 
          {{style paddingLeft=(if (and node.isLeaf (not node.hasParentSibling)) (this.calculatePadding node.treeDepth))}}
        >
          {{node.label}}
        </div>
      </AkStack>
    </AkTree>
  `,
  context: { ...args, ...actions },
});

export const Default = Template.bind({});

Default.args = {
  treeData: TREE_DATA,
  expanded: ['Root1', 'Root2', 'Root3'],
  checked: [],
  onExpand: action(onExpand),
  onCheck: action(onCheck),
};
