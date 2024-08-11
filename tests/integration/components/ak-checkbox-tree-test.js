import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// Flattens node props for assertions
const flatNodes = {};

const flattenNodes = (nodes, parent = {}, treeDepth = 0) => {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return;
  }

  nodes.forEach((node, index) => {
    const isParent = Array.isArray(node.children);

    flatNodes[node.key] = {
      ...node,
      parent,
      isParent,
      isLeaf: !isParent,
      treeDepth,
      index,
      disabled: Boolean(node.disabled),
      isChild: parent.key !== undefined,
      isRoot: treeDepth === 0,
      showCheckbox: node.showCheckbox !== undefined ? node.showCheckbox : true,
      hasParentSibling: !!parent.children?.some((c) => c.children?.length >= 1),
      indeterminate: false,
    };

    if (node.children) {
      flattenNodes(node.children, node, treeDepth + 1);
    }
  });

  return flatNodes;
};

// Asserts default state of nodes
const assertNodeElement = (assert, nodeElement, node) => {
  assert.dom(nodeElement).exists();

  assert
    .dom('[data-test-ak-checkbox-tree-nodeLabel]', nodeElement)
    .exists()
    .hasText(node.label);

  assert
    .dom('[data-test-ak-checkbox-tree-nodeCheckbox]', nodeElement)
    .exists()
    .isNotChecked();
};

module('Integration | Component | ak-checkbox-tree', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.setProperties({
      expanded: [],
      checked: [],
      onExpand: (expandedItems) => {
        this.set('expanded', expandedItems);
      },
      onCheck: (checkedItems) => {
        this.set('checked', checkedItems);
      },
    });
  });

  test('it renders tree and its nodes', async function (assert) {
    assert.expect();

    this.set('treeData', [
      {
        key: 'Root1',
        label: 'Root 1',
        expanded: true,
        children: [
          {
            key: 'Child1.1',
            label: 'Child 1.1',
          },
          {
            key: 'Child1.2',
            label: 'Child 1.2',
          },
        ],
      },
    ]);

    await render(hbs`
      <AkCheckboxTree
        @treeData={{this.treeData}}
        @expanded={{this.expanded}}
        @cascade={{this.cascade}}
        @checked={{this.checked}}
        @onCheck={{this.onCheck}}
        @onExpand={{this.onExpand}}
      />
    `);

    this.treeData.map((node) => {
      const nodeElement = find(
        `[data-test-ak-checkbox-tree-nodeKey='${node.key}']`
      );

      assertNodeElement(assert, nodeElement, node);

      node.children.map((child) => {
        const childElement = find(
          `[data-test-ak-checkbox-tree-nodeKey='${child.key}']`
        );

        assertNodeElement(assert, childElement, child);
      });
    });
  });

  test('it yields a custom node', async function (assert) {
    assert.expect();

    this.set('treeData', [
      {
        key: 'Root1',
        label: 'Root 1',
        expanded: true,
        children: [
          {
            key: 'Child1.1',
            label: 'Child 1.1',
          },
          {
            key: 'Child1.2',
            label: 'Child 1.2',
          },
        ],
      },
    ]);

    await render(hbs`
      <AkCheckboxTree
        @treeData={{this.treeData}}
        @expanded={{this.expanded}}
        @cascade={{this.cascade}}
        @checked={{this.checked}}
        @onCheck={{this.onCheck}}
        @onExpand={{this.onExpand}}
        as |node|
      >
        <div data-test-customRenderedNode="{{node.key}}" class="pl-{{node.treeDepth}} py-1">
          {{node.label}}
        </div>
      </AkCheckboxTree>
    `);

    this.treeData.map((node) => {
      const nodeElement = find(`[data-test-customRenderedNode='${node.key}']`);

      assert.dom(nodeElement).exists().containsText(node.label);

      node.children.map((child) => {
        const childElement = find(
          `[data-test-customRenderedNode='${child.key}']`
        );

        assert.dom(childElement).exists().containsText(child.label);
      });
    });
  });

  test('it expands a collapsed node', async function (assert) {
    assert.expect();

    this.setProperties({
      treeData: [
        {
          key: 'Root1',
          label: 'Root 1',
          expanded: false,
          children: [
            {
              key: 'Child1.1',
              label: 'Child 1.1',
            },
            {
              key: 'Child1.2',
              label: 'Child 1.2',
            },
          ],
        },
      ],
      parentId: 'Root1',
      childrenIds: ['Child1.1', 'Child1.2'],
    });

    const flattenedNodes = flattenNodes(this.treeData);

    await render(hbs`
      <AkCheckboxTree
        @treeData={{this.treeData}}
        @expanded={{this.expanded}}
        @cascade={{this.cascade}}
        @checked={{this.checked}}
        @onCheck={{this.onCheck}}
        @onExpand={{this.onExpand}}
      />
    `);

    const parentFlatNode = flattenedNodes[this.parentId];

    const parentNodeElem = find(
      `[data-test-ak-checkbox-tree-nodeKey='${parentFlatNode.key}']`
    );

    // Parent node is opened
    assertNodeElement(assert, parentNodeElem, parentFlatNode);

    // Child nodes should be hidden
    this.childrenIds.map((id) => {
      const childElement = find(`[data-test-ak-checkbox-tree-nodeKey='${id}']`);

      assert.dom(childElement).doesNotExist();
    });

    await click(parentNodeElem);

    // Child nodes should be visible
    this.childrenIds.map((id) => {
      const childFlatNode = flattenedNodes[id];
      const childElement = find(`[data-test-ak-checkbox-tree-nodeKey='${id}']`);

      assertNodeElement(assert, childElement, childFlatNode);
    });
  });

  test.each(
    'it checks a node checkbox if enabled',
    [true, false],
    async function (assert, disabled) {
      this.setProperties({
        treeData: [
          {
            key: 'Root1',
            label: 'Root 1',
            expanded: false,
            disabled,
          },
        ],
        nodeId: 'Root1',
      });

      const flattenedNodes = flattenNodes(this.treeData);

      await render(hbs`
        <AkCheckboxTree
          @treeData={{this.treeData}}
          @expanded={{this.expanded}}
          @cascade={{this.cascade}}
          @checked={{this.checked}}
          @onCheck={{this.onCheck}}
          @onExpand={{this.onExpand}}
        />
      `);

      const node = flattenedNodes[this.nodeId];

      const nodeElem = find(
        `[data-test-ak-checkbox-tree-nodeKey='${node.key}']`
      );

      // Parent node is opened
      assertNodeElement(assert, nodeElem, node);

      if (!disabled) {
        await click('[data-test-ak-checkbox-tree-nodeCheckbox]');

        assert
          .dom('[data-test-ak-checkbox-tree-nodeCheckbox]', nodeElem)
          .isChecked();
      } else {
        assert
          .dom('[data-test-ak-checkbox-tree-nodeCheckbox]', nodeElem)
          .isNotChecked()
          .isDisabled();
      }
    }
  );

  test('it renders a parent node indeterminate', async function (assert) {
    assert.expect();

    this.setProperties({
      treeData: [
        {
          key: 'Root1',
          label: 'Root 1',
          expanded: true,
          children: [
            {
              key: 'Child1.1',
              label: 'Child 1.1',
            },
            {
              key: 'Child1.2',
              label: 'Child 1.2',
            },
          ],
        },
      ],
      parentId: 'Root1',
      childIdToCheck: 'Child1.2',
    });

    const flattenedNodes = flattenNodes(this.treeData);

    await render(hbs`
      <AkCheckboxTree
        @treeData={{this.treeData}}
        @expanded={{this.expanded}}
        @cascade={{this.cascade}}
        @checked={{this.checked}}
        @onCheck={{this.onCheck}}
        @onExpand={{this.onExpand}}
      />
    `);

    const node = flattenedNodes[this.parentId];
    const nodeSelector = `[data-test-ak-checkbox-tree-nodeKey='${node.key}']`;
    const nodeElem = find(nodeSelector);

    assertNodeElement(assert, nodeElem, node);

    let nodeCheckbox = find(`${nodeSelector} [data-test-checkbox]`);

    assert.strictEqual(
      nodeCheckbox.dataset.indeterminate,
      'false',
      'Parent node is not in indeterminate state'
    );

    // Check one of the child elements
    await click(
      `[data-test-ak-checkbox-tree-nodeKey='${this.childIdToCheck}'] [data-test-checkbox]`
    );

    nodeCheckbox = find(`${nodeSelector} [data-test-checkbox]`);

    assert.strictEqual(
      nodeCheckbox.dataset.indeterminate,
      'true',
      'Parent node is in indeterminate state'
    );
  });

  test('it hides a node checkbox', async function (assert) {
    this.setProperties({
      treeData: [
        {
          key: 'Root1',
          label: 'Root 1',
          expanded: true,
          showCheckbox: false,
          children: [
            {
              key: 'Child1.1',
              label: 'Child 1.1',
              showCheckbox: false,
            },
            {
              key: 'Child1.2',
              label: 'Child 1.2',
              showCheckbox: true,
            },
          ],
        },
      ],
      parentId: 'Root1',
      childrenIds: ['Child1.1', 'Child1.2'],
    });

    const flattenedNodes = flattenNodes(this.treeData);

    await render(hbs`
      <AkCheckboxTree
        @treeData={{this.treeData}}
        @expanded={{this.expanded}}
        @cascade={{this.cascade}}
        @checked={{this.checked}}
        @onCheck={{this.onCheck}}
        @onExpand={{this.onExpand}}
      />
    `);

    const pNode = flattenedNodes[this.parentId];
    const pNodeSelector = `[data-test-ak-checkbox-tree-nodeKey='${pNode.key}']`;
    const pNodeCheckbox = `${pNodeSelector} [data-test-ak-checkbox-tree-nodeCheckbox]`;

    assert.dom(pNodeCheckbox).doesNotExist();

    // Child nodes should not have checkboxes
    this.childrenIds.map((id) => {
      const childNode = flattenedNodes[id];
      const childElemSelector = `[data-test-ak-checkbox-tree-nodeKey='${id}']`;
      const nodeCheckbox = `${childElemSelector} [data-test-ak-checkbox-tree-nodeCheckbox]`;

      if (!childNode.showCheckbox) {
        assert.dom(nodeCheckbox).doesNotExist();
      } else {
        assert.dom(nodeCheckbox).exists();
      }
    });
  });

  test.each('test: cascading', [true, false], async function (assert, cascade) {
    // Assumption: All nodes are unchecked by default
    this.onCheck = (checkedItems, fNode, flatNodes) => {
      this.set('checked', checkedItems);

      // test: Parent is checked and all children should be checked
      if (cascade && fNode.isParent) {
        fNode.children.forEach((c) =>
          assert.strictEqual(flatNodes[c.key].checked, fNode.checked)
        );
      }

      // test: Parent is checked and all children should not be checked and vice versa
      if (!cascade && fNode.isParent) {
        fNode.children.forEach((c) =>
          assert.notStrictEqual(flatNodes[c.key].checked, fNode.checked)
        );
      }
    };

    this.setProperties({
      cascade,
      treeData: [
        {
          key: 'Root1',
          label: 'Root 1',
          expanded: true,
          children: [
            {
              key: 'Child1.1',
              label: 'Child 1.1',
            },
            {
              key: 'Child1.2',
              label: 'Child 1.2',
            },
          ],
        },
      ],
      parentId: 'Root1',
      childrenIds: ['Child1.1', 'Child1.2'],
    });

    const flattenedNodes = flattenNodes(this.treeData);

    await render(hbs`
      <AkCheckboxTree
        @treeData={{this.treeData}}
        @expanded={{this.expanded}}
        @cascade={{this.cascade}}
        @checked={{this.checked}}
        @onCheck={{this.onCheck}}
        @onExpand={{this.onExpand}}
      />
    `);

    const parentNode = flattenedNodes[this.parentId];
    const pNodeSelector = `[data-test-ak-checkbox-tree-nodeKey='${parentNode.key}']`;
    const parentNodeCheckbox = find(`${pNodeSelector} [data-test-checkbox]`);

    assert.dom(parentNodeCheckbox).exists().isNotChecked();

    // Child nodes should not be checked
    this.childrenIds.map((id) => {
      const childElemSelector = `[data-test-ak-checkbox-tree-nodeKey='${id}']`;
      const nodeCheckbox = find(`${childElemSelector} [data-test-checkbox]`);

      assert.dom(nodeCheckbox).exists().isNotChecked();
    });

    if (cascade) {
      // Checking parent should check all children and vice versa
      await click(parentNodeCheckbox);

      assert.dom(parentNodeCheckbox).isChecked();

      // All Child nodes should be checked
      for (const id of this.childrenIds) {
        const childElemSelector = `[data-test-ak-checkbox-tree-nodeKey='${id}']`;
        const nodeCheckbox = find(`${childElemSelector} [data-test-checkbox]`);

        assert.dom(nodeCheckbox).isChecked();

        // Uncheck after assertion. Needed for parent cascading asserion
        await click(nodeCheckbox);

        assert.dom(nodeCheckbox).isNotChecked();
      }

      // Since all child nodes ended up unchecked the parent should be unchecked
      assert.dom(parentNodeCheckbox).isNotChecked();
    } else {
      // Parent is not checked by default
      assert.dom(parentNodeCheckbox).isNotChecked();

      // All Child nodes should not be checked
      for (const id of this.childrenIds) {
        const childElemSelector = `[data-test-ak-checkbox-tree-nodeKey='${id}']`;
        const nodeCheckbox = find(`${childElemSelector} [data-test-checkbox]`);

        assert.dom(nodeCheckbox).isNotChecked();

        // Check after assertion. Needed for parent cascading asserion
        await click(nodeCheckbox);

        assert.dom(nodeCheckbox).isChecked();
      }

      // All child nodes are checked but the parent node should remain unchecked
      assert.dom(parentNodeCheckbox).isNotChecked();

      // Uncheck all children
      for (const id of this.childrenIds) {
        const childElemSelector = `[data-test-ak-checkbox-tree-nodeKey='${id}']`;
        const nodeCheckbox = find(`${childElemSelector} [data-test-checkbox]`);

        await click(nodeCheckbox);

        assert.dom(nodeCheckbox).isNotChecked();
      }

      // Check parent
      await click(parentNodeCheckbox);

      // All children should remain unchecked
      for (const id of this.childrenIds) {
        const childElemSelector = `[data-test-ak-checkbox-tree-nodeKey='${id}']`;
        const nodeCheckbox = find(`${childElemSelector} [data-test-checkbox]`);

        assert.dom(nodeCheckbox).isNotChecked();
      }
    }
  });
});
