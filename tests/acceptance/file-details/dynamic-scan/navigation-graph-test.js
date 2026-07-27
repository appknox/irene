import { module, test } from 'qunit';

import {
  currentURL,
  find,
  findAll,
  triggerEvent,
  visit,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { t } from 'ember-intl/test-support';
import { Response } from 'miragejs';

import {
  chooseAkSelectOption,
  getAllAkSelectOptions,
} from 'irene/tests/helpers/mirage-utils';

import { assertBreadcrumbsUI } from 'irene/tests/helpers/breadcrumbs-utils';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import ENUMS from 'irene/enums';

const FILE_ID = '42';
const DS_ID = '7';
const NAV_GRAPH_URL = `/dashboard/file/${FILE_ID}/dynamic-scan/${DS_ID}/navigation-graph`;

const SEL = {
  title: '[data-test-fileDetails-dynamicScan-navigationGraph-notFoundTitle]',
  canvas: '[data-test-fileDetails-dynamicScan-navigationGraph-canvas]',
  toolbar: '[data-test-fileDetails-dynamicScan-navigationGraph-toolbar]',
  nodeLoader: '[data-test-fileDetails-dynamicScan-navigationGraph-nodeLoader]',
  drawerPrev: '[data-test-fileDetails-dynamicScan-navigationGraph-drawerPrev]',
  drawerNext: '[data-test-fileDetails-dynamicScan-navigationGraph-drawerNext]',

  roleSelect:
    '[data-test-fileDetails-dynamicScan-navigationGraph-userRoleSelect]',

  description:
    '[data-test-fileDetails-dynamicScan-navigationGraph-notFoundDescription]',

  actionLink:
    '[data-test-fileDetails-dynamicScan-navigationGraph-notFoundActionLink]',

  actionBtn:
    '[data-test-fileDetails-dynamicScan-navigationGraph-notFoundActionBtn]',

  breadcrumbs:
    '[data-test-fileDetails-dynamicScan-navigationGraph-notFound-breadcrumbs]',

  nodeFallback:
    '[data-test-fileDetails-dynamicScan-navigationGraph-nodeFallback]',

  drawerTitle:
    '[data-test-fileDetails-dynamicScan-navigationGraph-drawerTitle]',

  drawerImage:
    '[data-test-fileDetails-dynamicScan-navigationGraph-drawerImage]',

  layoutSelect:
    '[data-test-fileDetails-dynamicScan-navigationGraph-layoutSelect]',

  userRoleSkeleton:
    '[data-test-fileDetails-dynamicScan-navigationGraph-userRoleSkeleton]',
};

// ─── Test Helpers ──────────────────────────────────────────────────────────────────

// Creates a node object with the given id, execution order, and optional screenshot path.
function makeNode(id, executionOrder, screenshotPath = '') {
  return {
    id,
    label: id,
    variant_id: `variant-${id}`,
    title: `${id} screen`,
    visit_count: 1,
    execution_order: executionOrder,
    screenshot_path: screenshotPath,
  };
}

// Returns the cytoscape instance stored on the canvas element's internal `_cyreg`.
function cyFor() {
  return find(SEL.canvas)._cyreg.cy;
}

// Stubs a successful file + (empty) role list + navigation-graph payload.
function stubLoadedGraph(server, attrs = {}) {
  const graph = server.create('ds-navigation-graph', { id: DS_ID, ...attrs });

  // Stubs
  server.get('/v3/files/:id/last_automated_dynamic_scan', () => []);
  server.get('/v2/dynamicscans/:id/navigation_graph', () => graph.toJSON());

  return graph;
}

// Returns the navigation graph URL for the given scan id.
function getNavGraphUrl(scanId) {
  return `/dashboard/file/${FILE_ID}/dynamic-scan/${scanId}/navigation-graph`;
}

// Stubs a file with one automated scan per role and a per-scan navigation graph
function stubRoleGraphs(server, roles) {
  server.get('/v3/files/:id/last_automated_dynamic_scan', () =>
    roles.map(({ scanId, name, graph }) => ({
      id: scanId,
      status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
      mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
      is_navigation_graph_generated: !!graph,
      scenario_user_role: { id: scanId, name },
    }))
  );

  const graphs = {};

  roles.forEach(({ scanId, graph }) => {
    if (graph) {
      graphs[scanId] = server.create('ds-navigation-graph', {
        id: scanId,
        ...graph,
      });
    }
  });

  server.get('/v2/dynamicscans/:id/navigation_graph', (schema, req) => {
    const graph = graphs[req.params.id];

    return graph
      ? graph.toJSON()
      : new Response(404, {}, { detail: 'Not found' });
  });

  return graphs;
}

/**
 * `Image()` loads are native resource fetches (not XHR/fetch), so mirage
 * can't see or delay them. We stub the global constructor so the test can
 * resolve or reject each load on cue.
 *
 * Returns a controller with `resolve(src)`, `reject(src)`, and `restore()`.
 */
function installImageStub() {
  const images = [];
  const Original = globalThis.Image;

  globalThis.Image = function () {
    const image = { complete: false, naturalWidth: 0 };
    image.addEventListener = (type, cb) => (image[`on${type}`] = cb);
    images.push(image);

    return image;
  };

  const find = (src) => images.find((img) => img.src === src);

  return {
    resolve: (src) => find(src)?.onload(),
    reject: (src) => find(src)?.onerror(),
    restore: () => {
      globalThis.Image = Original;
    },
  };
}

// ─── Test Starts Here ────────────────────────────────────────────────────────────
module(
  'Acceptance | file-details/dynamic-scan/navigation-graph',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);
    setupBrowserFakes(hooks, { window: true });

    hooks.beforeEach(async function () {
      await setupRequiredEndpoints(this.server);

      // Stub the file endpoint.
      this.server.create('file', { id: FILE_ID });

      this.server.get('/v3/files/:id', (schema, req) =>
        schema.files.find(req.params.id)?.toJSON()
      );
    });

    // ─── Invalid file ────────────────────────────────────────────────────────

    test('shows the invalid-file error state when the file fails to load', async function (assert) {
      // 6 direct assertions + assertBreadcrumbsUI (1 length check + 3 item checks).
      assert.expect(10);

      this.server.get(
        '/v3/files/:id',
        () => new Response(404, {}, { detail: 'Not found' })
      );

      await visit(NAV_GRAPH_URL);

      assert.strictEqual(
        currentURL(),
        NAV_GRAPH_URL,
        'stays on the navigation-graph route (error substate)'
      );

      assert.dom(SEL.title).hasText(t('navigationGraph.notFoundTitle'));

      assert
        .dom(SEL.description)
        .hasText(t('navigationGraph.notFoundInvalidFile'));

      assert.dom(SEL.actionBtn).hasText(t('gotoHome'));
      assert.dom(SEL.actionLink).hasAttribute('href', /\/home$/);
      assert.dom(SEL.breadcrumbs).exists();

      assertBreadcrumbsUI(
        [t('home'), t('allProjects'), t('navigationGraph.title')],
        assert
      );
    });

    // ─── Valid file, errored navigation graph ──────────────────────────────────

    test('shows the dynamic-scan error state when the file is valid but the graph fails to load', async function (assert) {
      // 6 direct assertions + assertBreadcrumbsUI (1 length check + 4 item checks).
      assert.expect(11);

      this.server.get(
        '/v2/dynamicscans/:id/navigation_graph',
        () => new Response(404, {}, { detail: 'Not found' })
      );

      await visit(NAV_GRAPH_URL);

      assert.strictEqual(
        currentURL(),
        NAV_GRAPH_URL,
        'stays on the navigation-graph route (error substate)'
      );

      assert.dom(SEL.title).hasText(t('navigationGraph.notFoundTitle'));

      assert
        .dom(SEL.description)
        .hasText(t('navigationGraph.notFoundInvalidDynamicScan'));

      assert.dom(SEL.actionBtn).hasText(t('navigationGraph.backToFileDetails'));

      assert
        .dom(SEL.actionLink)
        .hasAttribute('href', new RegExp(`/file/${FILE_ID}$`));

      assert.dom(SEL.breadcrumbs).exists();

      // The file itself loaded, so the fallback trail includes Scan Details
      // ahead of Navigation Graph.
      assertBreadcrumbsUI(
        [
          t('home'),
          t('allProjects'),
          t('scanDetails'),
          t('navigationGraph.title'),
        ],
        assert
      );
    });

    // ─── Graph renders ─────────────────────────────────────────────────────────

    test('renders the graph canvas with the correct nodes and edges', async function (assert) {
      const graph = stubLoadedGraph(this.server);

      await visit(NAV_GRAPH_URL);

      assert.dom(SEL.canvas).exists('the graph canvas is rendered');
      assert.dom(SEL.title).doesNotExist('the not-found state is not shown');
      assert.dom(SEL.toolbar).exists('the nav panel is rendered');

      const cy = cyFor();

      assert.strictEqual(
        cy.nodes().length,
        graph.nodes.length,
        'every node is added'
      );

      assert.strictEqual(
        cy.edges().length,
        graph.edges.length,
        'every edge is added'
      );

      // Screenshots paint in asynchronously once each node's `Image()` load
      // resolves, so wait for every one to settle before comparing.
      await waitUntil(
        () =>
          graph.nodes.every((node) =>
            cy.getElementById(node.id).data('screenshot')
          ),
        { timeout: 2000 }
      );

      // Sanity-check every node's data on the canvas against the model.
      const expectedNodes = [];
      const actualNodes = [];

      graph.nodes.forEach((node) => {
        const expectedNode = {
          id: node.id,
          label: node.label,
          title: node.title,
          variant_id: node.variant_id,
          visit_count: node.visit_count,
          execution_order: node.execution_order,
          screenshot: node.screenshot_path,
        };

        // Render the node and get its data.
        const cyNode = cy.getElementById(node.id);

        const actualNode = {
          id: cyNode.id(),
          label: cyNode.data('label'),
          title: cyNode.data('title'),
          variant_id: cyNode.data('variant_id'),
          visit_count: cyNode.data('visit_count'),
          execution_order: cyNode.data('execution_order'),
          screenshot: cyNode.data('screenshot'),
        };

        expectedNodes.push(expectedNode);
        actualNodes.push(actualNode);
      });

      assert.deepEqual(
        actualNodes,
        expectedNodes,
        'every node renders with the correct data'
      );

      // ...and every edge wires the right source and target.
      const expectedEdges = [];
      const actualEdges = [];

      graph.edges.map((edge) => {
        const expectedEdge = {
          id: edge.id,
          source: edge.source,
          target: edge.target,
        };

        const cyEdge = cy.getElementById(edge.id);

        const actualEdge = {
          id: cyEdge.id(),
          source: cyEdge.source().id(),
          target: cyEdge.target().id(),
        };

        expectedEdges.push(expectedEdge);
        actualEdges.push(actualEdge);
      });

      assert.deepEqual(
        actualEdges,
        expectedEdges,
        'every edge wires the right source and target'
      );
    });

    test('renders the in-page not-found for an empty graph but keeps the nav panel', async function (assert) {
      stubLoadedGraph(this.server, { nodes: [], edges: [] });

      await visit(NAV_GRAPH_URL);

      assert.dom(SEL.canvas).doesNotExist('no canvas when the graph is empty');
      assert.dom(SEL.title).hasText(t('navigationGraph.notFoundTitle'));

      assert
        .dom(SEL.description)
        .hasText(t('navigationGraph.notFoundDescription'));

      assert.dom(SEL.toolbar).exists('the nav panel is still shown');
    });

    // ─── Layout (view) switching ───────────────────────────────────────────────

    test('switching the layout select re-runs the graph with the chosen layout', async function (assert) {
      stubLoadedGraph(this.server);

      await visit(NAV_GRAPH_URL);

      const cy = cyFor();
      let lastLayoutName = null;

      // `layoutstart` fires synchronously as soon as a layout run kicks off,
      // so capturing it tells us which algorithm cytoscape actually ran.
      cy.on('layoutstart', (event) => {
        lastLayoutName = event.layout.options.name;
      });

      await chooseAkSelectOption({
        selectTriggerClass: SEL.layoutSelect,
        labelToSelect: t('navigationGraph.breadthfirst'),
      });

      assert.strictEqual(
        lastLayoutName,
        'breadthfirst',
        'switching to Breadthfirst re-runs the graph with that layout'
      );

      await chooseAkSelectOption({
        selectTriggerClass: SEL.layoutSelect,
        labelToSelect: t('navigationGraph.grid'),
      });

      assert.strictEqual(
        lastLayoutName,
        'grid',
        'switching back to Grid re-runs the graph with that layout'
      );
    });

    test('disables the layout select for an empty graph and enables it once data loads', async function (assert) {
      stubLoadedGraph(this.server, { nodes: [], edges: [] });

      await visit(NAV_GRAPH_URL);

      assert
        .dom(`${SEL.layoutSelect} .ember-power-select-trigger`)
        .hasAttribute(
          'aria-disabled',
          'true',
          'the layout select is disabled when there are no nodes or edges'
        );
    });

    test('enables the layout select when the graph has nodes and edges', async function (assert) {
      stubLoadedGraph(this.server);

      await visit(NAV_GRAPH_URL);

      const trigger = find(`${SEL.layoutSelect} .ember-power-select-trigger`);

      assert.notEqual(
        trigger.getAttribute('aria-disabled'),
        'true',
        'the layout select is enabled when the graph has data'
      );
    });

    // ─── Canvas interactions ───────────────────────────────────────────────────

    test('tapping a node opens its screenshot drawer and marks it active', async function (assert) {
      const graph = stubLoadedGraph(this.server);

      await visit(NAV_GRAPH_URL);

      const cy = cyFor();
      const [node] = graph.nodes;

      cy.getElementById(node.id).emit('tap');

      // A single tap is debounced before it opens the drawer.
      await waitFor(SEL.drawerTitle, { timeout: 1000 });

      assert.dom(SEL.drawerTitle).hasText(node.title);

      assert
        .dom(SEL.drawerImage)
        .hasAttribute(
          'src',
          node.screenshot_path,
          "the drawer image src matches the node's screenshot"
        );

      assert.true(
        cy.getElementById(node.id).hasClass('active'),
        'the tapped node is marked active'
      );
    });

    test('double-tapping a node focuses its neighborhood; Escape clears it', async function (assert) {
      const graph = stubLoadedGraph(this.server);

      await visit(NAV_GRAPH_URL);

      const cy = cyFor();
      const [first] = graph.nodes;
      const last = graph.nodes[graph.nodes.length - 1];

      cy.getElementById(first.id).emit('dbltap');

      assert.true(
        cy.getElementById(first.id).hasClass('focused'),
        'the double-tapped node and its neighborhood are focused'
      );

      assert.true(
        cy.getElementById(last.id).hasClass('faded'),
        'a node outside the neighborhood is faded'
      );

      await triggerEvent(document, 'keydown', { key: 'Escape' });

      assert.strictEqual(cy.elements('.focused').length, 0, 'focus is cleared');
      assert.strictEqual(cy.elements('.faded').length, 0, 'fade is cleared');
    });

    test('Ctrl+Z resets the graph and closes an open drawer', async function (assert) {
      const graph = stubLoadedGraph(this.server);

      await visit(NAV_GRAPH_URL);

      const cy = cyFor();

      cy.getElementById(graph.nodes[0].id).emit('tap');

      await waitFor(SEL.drawerTitle, { timeout: 1000 });

      assert.dom(SEL.drawerTitle).exists('the drawer is open');

      await triggerEvent(document, 'keydown', { key: 'z', ctrlKey: true });

      assert.dom(SEL.drawerTitle).doesNotExist('reset closes the drawer');
    });

    test('pressing Escape key closes an open drawer and deactivates its node', async function (assert) {
      const graph = stubLoadedGraph(this.server);

      await visit(NAV_GRAPH_URL);

      const cy = cyFor();
      const [node] = graph.nodes;

      cy.getElementById(node.id).emit('tap');

      await waitFor(SEL.drawerTitle, { timeout: 1000 });

      assert.dom(SEL.drawerTitle).exists('the drawer is open');

      assert.true(
        cy.getElementById(node.id).hasClass('active'),
        'the tapped node is marked active'
      );

      await triggerEvent(document, 'keydown', { key: 'Escape' });

      assert.dom(SEL.drawerTitle).doesNotExist('Escape closes the drawer');

      assert.false(
        cy.getElementById(node.id).hasClass('active'),
        'the closed node is no longer marked active'
      );
    });

    test('ArrowRight/ArrowLeft step through nodes in the open drawer', async function (assert) {
      const graph = stubLoadedGraph(this.server);

      await visit(NAV_GRAPH_URL);

      const cy = cyFor();
      const [first, second] = graph.nodes;

      cy.getElementById(first.id).emit('tap');

      await waitFor(SEL.drawerTitle, { timeout: 1000 });

      assert
        .dom(SEL.drawerTitle)
        .hasText(first.title, 'opens on the tapped node');

      assert
        .dom(SEL.drawerPrev)
        .hasAttribute('disabled', '', 'no previous node at the start');

      assert
        .dom(SEL.drawerNext)
        .doesNotHaveAttribute('disabled', 'a next node is available');

      await triggerEvent(document, 'keydown', { key: 'ArrowRight' });

      assert
        .dom(SEL.drawerTitle)
        .hasText(second.title, 'ArrowRight steps to the next node');

      assert.true(
        cy.getElementById(second.id).hasClass('active'),
        'the next node becomes active'
      );

      assert.false(
        cy.getElementById(first.id).hasClass('active'),
        'the previous node is no longer active'
      );

      assert
        .dom(SEL.drawerPrev)
        .doesNotHaveAttribute('disabled', 'a previous node is now available');

      await triggerEvent(document, 'keydown', { key: 'ArrowLeft' });

      assert
        .dom(SEL.drawerTitle)
        .hasText(first.title, 'ArrowLeft steps back to the previous node');

      assert.true(
        cy.getElementById(first.id).hasClass('active'),
        'the previous node is active again'
      );
    });

    test('ArrowLeft/ArrowRight are no-ops at the first and last node', async function (assert) {
      const graph = stubLoadedGraph(this.server);

      await visit(NAV_GRAPH_URL);

      const cy = cyFor();
      const [first] = graph.nodes;
      const last = graph.nodes[graph.nodes.length - 1];

      cy.getElementById(first.id).emit('tap');

      await waitFor(SEL.drawerTitle, { timeout: 1000 });

      await triggerEvent(document, 'keydown', { key: 'ArrowLeft' });

      assert
        .dom(SEL.drawerTitle)
        .hasText(first.title, 'ArrowLeft does nothing before the first node');

      cy.getElementById(last.id).emit('tap');

      await waitUntil(
        () => find(SEL.drawerTitle)?.textContent?.trim() === last.title,
        { timeout: 1000 }
      );

      assert
        .dom(SEL.drawerNext)
        .hasAttribute('disabled', '', 'no next node at the end');

      await triggerEvent(document, 'keydown', { key: 'ArrowRight' });

      assert
        .dom(SEL.drawerTitle)
        .hasText(last.title, 'ArrowRight does nothing past the last node');
    });

    // ─── Per-node screenshots ──────────────────────────────────────────────────

    test('shows a loading overlay until each node screenshot resolves to its image or a fallback', async function (assert) {
      assert.expect(5);

      const GOOD = 'https://example.test/good.png';
      const BAD = 'https://example.test/bad.png';
      const BAD_TOO = 'https://example.test/bad-too.png';

      const graph = stubLoadedGraph(this.server, {
        nodes: [
          makeNode('n1', 1, GOOD),
          makeNode('n2', 2, BAD),
          makeNode('n3', 3, BAD_TOO),
        ],
        edges: [],
      });

      const [loadable, broken, brokenToo] = graph.nodes;
      const imageStub = installImageStub();

      try {
        await visit(NAV_GRAPH_URL);

        assert
          .dom(SEL.nodeLoader)
          .exists(
            { count: 3 },
            'a loading overlay shows for every node with a screenshot to load'
          );

        imageStub.resolve(GOOD);
        imageStub.reject(BAD);
        imageStub.reject(BAD_TOO);

        await waitUntil(() => !find(SEL.nodeLoader), { timeout: 1000 });

        const fallbackNodeIds = findAll(SEL.nodeFallback)
          .map((el) => el.dataset['nodeLoaderId'])
          .sort((a, b) => a.localeCompare(b));

        assert.deepEqual(
          fallbackNodeIds,
          [broken.id, brokenToo.id].sort((a, b) => a.localeCompare(b)),
          'a fallback shows for every failed node'
        );

        const screenshotOn = (id) =>
          cyFor().getElementById(id).data('screenshot');

        assert.strictEqual(
          screenshotOn(loadable.id),
          loadable.screenshot_path,
          'the loaded screenshot is painted on its node'
        );

        assert.strictEqual(
          screenshotOn(broken.id),
          undefined,
          'a broken screenshot is never painted'
        );

        assert.strictEqual(
          screenshotOn(brokenToo.id),
          undefined,
          'a broken screenshot is never painted'
        );
      } finally {
        imageStub.restore();
      }
    });

    // ─── Role switching ──────────────────────────────────────────────────────

    test('hides the role select when no roles are available', async function (assert) {
      // `stubLoadedGraph` returns an empty role list (`last_automated_dynamic_scan`).
      stubLoadedGraph(this.server);

      await visit(NAV_GRAPH_URL);

      await waitUntil(() => !find(SEL.userRoleSkeleton), { timeout: 1000 });

      assert
        .dom(SEL.roleSelect)
        .doesNotExist('no role select when there are no roles');

      assert
        .dom(SEL.userRoleSkeleton)
        .doesNotExist('no loading skeleton once roles have loaded');
    });

    test("switching roles renders the selected role's graph and the empty state for an empty one", async function (assert) {
      const graphs = stubRoleGraphs(this.server, [
        { scanId: DS_ID, name: 'Admin', graph: {} }, // populated (factory default)
        { scanId: '8', name: 'Guest', graph: { nodes: [], edges: [] } }, // empty
      ]);

      // Start on the populated role.
      await visit(getNavGraphUrl(DS_ID));

      assert.dom(SEL.canvas).exists('the populated role renders its graph');

      assert.strictEqual(
        cyFor().nodes().length,
        graphs[DS_ID].nodes.length,
        "the populated role's nodes render"
      );

      // Roles load asynchronously, so wait for the select before opening it.
      await waitFor(SEL.roleSelect);

      await chooseAkSelectOption({
        selectTriggerClass: SEL.roleSelect,
        labelToSelect: 'Guest',
      });

      assert.strictEqual(
        currentURL(),
        getNavGraphUrl('8'),
        'navigates to the selected role'
      );

      assert.dom(SEL.canvas).doesNotExist('the empty role shows no canvas');
      assert.dom(SEL.title).hasText(t('navigationGraph.notFoundTitle'));

      assert
        .dom(SEL.description)
        .hasText(t('navigationGraph.notFoundDescription'));

      // Switch back to the populated role (the re-render re-runs the task).
      await waitFor(SEL.roleSelect);

      await chooseAkSelectOption({
        selectTriggerClass: SEL.roleSelect,
        labelToSelect: 'Admin',
      });

      assert.strictEqual(currentURL(), getNavGraphUrl(DS_ID), 'navigates back');

      assert
        .dom(SEL.canvas)
        .exists('the populated role renders its graph again');

      assert.strictEqual(
        cyFor().nodes().length,
        graphs[DS_ID].nodes.length,
        "the populated role's nodes render again"
      );
    });

    test('a role without a navigation graph is disabled in the role switcher', async function (assert) {
      stubRoleGraphs(this.server, [
        { scanId: DS_ID, name: 'Admin', graph: {} }, // has a graph
        { scanId: '9', name: 'Support', graph: null }, // no graph → 404
      ]);

      await visit(getNavGraphUrl(DS_ID));

      // Roles load asynchronously, so wait for the select before opening it.
      await waitFor(SEL.roleSelect);

      const options = await getAllAkSelectOptions(SEL.roleSelect);

      const disabled = options.filter(
        (option) => option.getAttribute('aria-disabled') === 'true'
      );

      assert.strictEqual(disabled.length, 1, 'one role is disabled');

      assert
        .dom(disabled[0])
        .containsText('Support', 'the graph-less role is disabled');
    });
  }
);
