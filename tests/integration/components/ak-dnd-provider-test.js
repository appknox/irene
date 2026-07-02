import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ──────────────────────────────────────────────────────────────
const SEL = {
  state: '[data-test-dnd-state]',
  item: (i) => `[data-test-dnd-item="${i}"]`,
  isDragging: '[data-test-dnd-is-dragging]',
};

// ─── Template ───────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <AkDndProvider @items={{this.items}} @onReorder={{this.onReorder}} as |dnd|>
    <div
      data-test-dnd-state
      data-dragging-index={{dnd.draggingIndex}}
      data-drag-over-index={{dnd.dragOverIndex}}
    >
      {{#if dnd.isDragging}}
        <span data-test-dnd-is-dragging>dragging</span>
      {{/if}}

      {{#each dnd.items as |item i|}}
        <div
          data-test-dnd-item={{i}}
          draggable='true'
          {{on 'dragstart' (fn dnd.onDragStart i)}}
          {{on 'dragover' (fn dnd.onDragOver i)}}
          {{on 'dragleave' (fn dnd.onDragLeave i)}}
          {{on 'drop' (fn dnd.onDrop i)}}
          {{on 'dragend' dnd.onDragEnd}}
        >
          {{item.name}}
        </div>
      {{/each}}
    </div>
  </AkDndProvider>
`;

// ─── Helper functions ───────────────────────────────────────────────────────

// Get the attribute value of the state element.
function getAttr(attr) {
  return find(SEL.state)?.getAttribute(attr) ?? null;
}

// ─── Test suite ─────────────────────────────────────────────────────────────
module('Integration | Component | ak-dnd-provider', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.items = [
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Beta' },
      { id: 3, name: 'Gamma' },
    ];

    this.reorderCallCount = 0;
    this.lastReorderArgs = null;

    this.onReorder = (items, fromIndex, toIndex) => {
      this.reorderCallCount++;
      this.lastReorderArgs = { items, fromIndex, toIndex };
    };
  });

  // ─── Initial state ────────────────────────────────────────────────────────

  test('renders all items and yields the API', async function (assert) {
    await render(TEMPLATE);

    assert.dom(SEL.item(0)).exists().hasText('Alpha');
    assert.dom(SEL.item(1)).exists().hasText('Beta');
    assert.dom(SEL.item(2)).exists().hasText('Gamma');
  });

  test('initial state: draggingIndex and dragOverIndex are null, isDragging is false', async function (assert) {
    await render(TEMPLATE);

    assert.strictEqual(
      getAttr('data-dragging-index'),
      null,
      'draggingIndex starts null'
    );

    assert.strictEqual(
      getAttr('data-drag-over-index'),
      null,
      'dragOverIndex starts null'
    );

    assert.dom(SEL.isDragging).doesNotExist('isDragging starts false');
  });

  // ─── Drag start ───────────────────────────────────────────────────────────

  test('dragstart: sets draggingIndex and isDragging', async function (assert) {
    await render(TEMPLATE);

    await triggerEvent(SEL.item(1), 'dragstart');

    assert.strictEqual(
      getAttr('data-dragging-index'),
      '1',
      'draggingIndex becomes 1'
    );

    assert.dom(SEL.isDragging).exists('isDragging becomes true');
  });

  // ─── Drag over ────────────────────────────────────────────────────────────

  test('dragover: sets dragOverIndex', async function (assert) {
    await render(TEMPLATE);

    await triggerEvent(SEL.item(0), 'dragstart');
    await triggerEvent(SEL.item(2), 'dragover');

    assert.strictEqual(
      getAttr('data-drag-over-index'),
      '2',
      'dragOverIndex becomes 2'
    );
  });

  test('dragover: does not update dragOverIndex when hovering the same index again', async function (assert) {
    await render(TEMPLATE);

    await triggerEvent(SEL.item(0), 'dragstart');
    await triggerEvent(SEL.item(2), 'dragover');
    await triggerEvent(SEL.item(2), 'dragover');

    assert.strictEqual(
      getAttr('data-drag-over-index'),
      '2',
      'dragOverIndex unchanged'
    );
  });

  // ─── Drag leave ───────────────────────────────────────────────────────────

  test('dragleave: clears dragOverIndex when index matches', async function (assert) {
    await render(TEMPLATE);

    await triggerEvent(SEL.item(0), 'dragstart');
    await triggerEvent(SEL.item(2), 'dragover');
    await triggerEvent(SEL.item(2), 'dragleave');

    assert.strictEqual(
      getAttr('data-drag-over-index'),
      null,
      'dragOverIndex cleared'
    );
  });

  test('dragleave: does NOT clear dragOverIndex when index differs', async function (assert) {
    await render(TEMPLATE);

    await triggerEvent(SEL.item(0), 'dragstart');
    await triggerEvent(SEL.item(2), 'dragover');
    await triggerEvent(SEL.item(1), 'dragleave'); // wrong index

    assert.strictEqual(
      getAttr('data-drag-over-index'),
      '2',
      'dragOverIndex unchanged'
    );
  });

  // ─── Drop ─────────────────────────────────────────────────────────────────

  test('drop: calls onReorder with correctly reordered items and indices', async function (assert) {
    await render(TEMPLATE);

    await triggerEvent(SEL.item(0), 'dragstart'); // drag Alpha
    await triggerEvent(SEL.item(2), 'drop'); // drop onto Gamma

    assert.strictEqual(this.reorderCallCount, 1, 'onReorder called once');

    assert.deepEqual(
      this.lastReorderArgs.items.map((i) => i.name),
      ['Beta', 'Gamma', 'Alpha'],
      'items reordered correctly'
    );

    assert.strictEqual(this.lastReorderArgs.fromIndex, 0, 'fromIndex is 0');
    assert.strictEqual(this.lastReorderArgs.toIndex, 2, 'toIndex is 2');
  });

  test('drop: resets draggingIndex and dragOverIndex', async function (assert) {
    await render(TEMPLATE);

    await triggerEvent(SEL.item(0), 'dragstart');
    await triggerEvent(SEL.item(2), 'dragover');
    await triggerEvent(SEL.item(2), 'drop');

    assert.strictEqual(
      getAttr('data-dragging-index'),
      null,
      'draggingIndex reset'
    );

    assert.strictEqual(
      getAttr('data-drag-over-index'),
      null,
      'dragOverIndex reset'
    );

    assert.dom(SEL.isDragging).doesNotExist('isDragging is false');
  });

  test('drop on same index: does NOT call onReorder', async function (assert) {
    await render(TEMPLATE);

    await triggerEvent(SEL.item(1), 'dragstart');
    await triggerEvent(SEL.item(1), 'drop');

    assert.strictEqual(this.reorderCallCount, 0, 'onReorder not called');
  });

  // ─── Drag end ─────────────────────────────────────────────────────────────

  test('dragend: resets all drag state', async function (assert) {
    await render(TEMPLATE);

    await triggerEvent(SEL.item(1), 'dragstart');
    await triggerEvent(SEL.item(2), 'dragover');
    await triggerEvent(SEL.item(1), 'dragend');

    assert.strictEqual(
      getAttr('data-dragging-index'),
      null,
      'draggingIndex reset'
    );

    assert.strictEqual(
      getAttr('data-drag-over-index'),
      null,
      'dragOverIndex reset'
    );

    assert.dom(SEL.isDragging).doesNotExist('isDragging is false');
  });
});
