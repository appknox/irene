import { module, test } from 'qunit';

import {
  GRAPH_LAYOUT_OPTIONS,
  GRAPH_FIT_PADDING,
  MIN_GRAPH_ZOOM,
  MAX_GRAPH_ZOOM,
  compareByExecutionOrder,
  buildGraphElements,
  buildGraphLayoutOptions,
} from 'irene/components/file-details/dynamic-scan/navigation-graph/graph-config';

// Minimal stand-in for a cytoscape NodeSingular: the comparator only ever
// reads `node.data('execution_order')`.
function cyNode(executionOrder) {
  return { data: () => executionOrder };
}

function makeNode(overrides = {}) {
  return {
    id: 'n1',
    label: 'Login',
    variant_id: 'v1',
    title: 'Login Screen',
    visit_count: 3,
    execution_order: 1,
    screenshot_path: 'https://example.com/shot.png',
    ...overrides,
  };
}

function makeEdge(overrides = {}) {
  return {
    id: 'e1',
    source: 'n1',
    target: 'n2',
    label: 'tap',
    action_type: 'tap',
    ...overrides,
  };
}

module(
  'Unit | Component | file-details/dynamic-scan/navigation-graph/graph-config',
  function () {
    // ─── compareByExecutionOrder ──────────────────────────────────────────────

    test.each(
      'orders nodes by execution_order (sign of the comparison)',
      [
        [1, 2, -1],
        [5, 2, 1],
        [3, 3, 0],
        [-2, 1, -1],
        // 0 is a real order, not "missing".
        [0, 3, -1],
        [3, 0, 1],
        // Missing / null orders sink to the end (treated as Infinity).
        [undefined, 5, 1],
        [5, undefined, -1],
        [null, 5, 1],
      ],
      function (assert, [a, b, expectedSign]) {
        assert.strictEqual(
          Math.sign(compareByExecutionOrder(cyNode(a), cyNode(b))),
          expectedSign,
          `(${a}, ${b}) → sign ${expectedSign}`
        );
      }
    );

    test('treats execution_order 0 as a real value, not missing', function (assert) {
      // `??` keeps 0; `||` would have pushed it to Infinity (the end).
      assert.true(
        compareByExecutionOrder(cyNode(0), cyNode(5)) < 0,
        '0 sorts before 5'
      );
    });

    test('returns NaN when both nodes lack an execution_order', function (assert) {
      assert.true(
        Number.isNaN(
          compareByExecutionOrder(cyNode(undefined), cyNode(undefined))
        ),
        'Infinity - Infinity is NaN'
      );
    });

    test('sorts an array ascending, pushing missing orders last', function (assert) {
      const nodes = [cyNode(3), cyNode(undefined), cyNode(1), cyNode(2)];

      const ordered = [...nodes]
        .sort(compareByExecutionOrder)
        .map((n) => n.data('execution_order'));

      assert.deepEqual(ordered, [1, 2, 3, undefined]);
    });

    // ─── buildGraphElements ───────────────────────────────────────────────────

    test('returns an empty array for no nodes and no edges', function (assert) {
      assert.deepEqual(buildGraphElements([], []), []);
    });

    test('maps a node to its element data and omits the screenshot', function (assert) {
      const [el] = buildGraphElements([makeNode()], []);

      assert.deepEqual(
        el.data,
        {
          id: 'n1',
          label: 'Login',
          variant_id: 'v1',
          title: 'Login Screen',
          visit_count: 3,
          execution_order: 1,
        },
        'only the whitelisted node fields are copied'
      );

      assert.notOk('screenshot' in el.data, 'screenshot key is omitted');
      assert.notOk(
        'screenshot_path' in el.data,
        'screenshot_path is not copied'
      );
    });

    test('maps an edge to its element data', function (assert) {
      const [el] = buildGraphElements([], [makeEdge()]);

      assert.deepEqual(el.data, {
        id: 'e1',
        source: 'n1',
        target: 'n2',
        label: 'tap',
        action_type: 'tap',
      });
    });

    test('returns nodes first, then edges', function (assert) {
      const result = buildGraphElements(
        [makeNode({ id: 'n1' }), makeNode({ id: 'n2' })],
        [makeEdge({ id: 'e1' })]
      );

      assert.deepEqual(
        result.map((el) => el.data.id),
        ['n1', 'n2', 'e1']
      );
    });

    test('preserves input node order (does not sort by execution_order)', function (assert) {
      const result = buildGraphElements(
        [
          makeNode({ id: 'a', execution_order: 3 }),
          makeNode({ id: 'b', execution_order: 1 }),
        ],
        []
      );

      assert.deepEqual(
        result.map((el) => el.data.id),
        ['a', 'b']
      );
    });

    test.each(
      'keeps falsy-but-valid node values',
      [
        ['execution_order', 0],
        ['visit_count', 0],
        ['title', ''],
        ['label', ''],
      ],
      function (assert, [field, value]) {
        const [el] = buildGraphElements([makeNode({ [field]: value })], []);

        assert.strictEqual(
          el.data[field],
          value,
          `${field} kept as ${JSON.stringify(value)}`
        );
      }
    );

    // ─── buildGraphLayoutOptions ──────────────────────────────────────────────

    test('grid layout includes grid options and the execution-order sort', function (assert) {
      const layout = buildGraphLayoutOptions('grid');

      assert.strictEqual(layout.name, 'grid');
      assert.true(layout.avoidOverlap);
      assert.strictEqual(layout.avoidOverlapPadding, 96);
      assert.true(layout.nodeDimensionsIncludeLabels);
      assert.false(layout.condense);

      assert.strictEqual(
        layout.sort,
        compareByExecutionOrder,
        'uses the execution-order comparator'
      );

      assert.notOk('roots' in layout, 'grid has no roots');
    });

    test('grid layout ignores the root argument', function (assert) {
      const layout = buildGraphLayoutOptions('grid', cyNode(1));

      assert.notOk('roots' in layout, 'root has no effect on grid');
    });

    test('breadthfirst layout without a root omits roots', function (assert) {
      const layout = buildGraphLayoutOptions('breadthfirst');

      assert.strictEqual(layout.name, 'breadthfirst');
      assert.true(layout.directed);
      assert.false(layout.circle);
      assert.false(layout.grid);
      assert.strictEqual(layout.spacingFactor, 2);
      assert.notOk('roots' in layout, 'no roots when root not provided');
    });

    test('breadthfirst layout includes the root when provided', function (assert) {
      const root = cyNode(1);
      const layout = buildGraphLayoutOptions('breadthfirst', root);

      assert.strictEqual(layout.roots, root);
    });

    test.each(
      'both layouts share the common fit/padding/animate options',
      ['grid', 'breadthfirst'],
      function (assert, name) {
        const layout = buildGraphLayoutOptions(name);

        assert.strictEqual(
          layout.padding,
          GRAPH_FIT_PADDING,
          `${name} padding`
        );
        assert.strictEqual(layout.fit, true, `${name} fit`);
        assert.strictEqual(layout.animate, true, `${name} animate`);
      }
    );

    // ─── Exported constants ───────────────────────────────────────────────────

    test('exposes both layout options in order', function (assert) {
      assert.deepEqual(
        GRAPH_LAYOUT_OPTIONS.map((option) => option.value),
        ['grid', 'breadthfirst']
      );
    });

    test('zoom bounds are ordered', function (assert) {
      assert.true(
        MIN_GRAPH_ZOOM < MAX_GRAPH_ZOOM,
        'min zoom is below max zoom'
      );
    });
  }
);
