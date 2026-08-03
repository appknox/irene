import {
  find,
  render,
  triggerEvent,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import {
  chooseAkSelectOption,
  getAllAkSelectOptions,
} from 'irene/tests/helpers/mirage-utils';

import ENUMS from 'irene/enums';

const STATUS = ENUMS.DYNAMIC_SCAN_STATUS;
const AUTOMATED = ENUMS.DYNAMIC_MODE.AUTOMATED;
const FILE_ID = '42';

// Captures router.replaceWith calls instead of performing a real transition,
// which would fail in a rendering test.
class RouterStub extends Service {
  replaceCalls = [];

  replaceWith(...args) {
    this.replaceCalls.push(args);
  }
}

const SEL = {
  toolbar: '[data-test-fileDetails-dynamicScan-navigationGraph-toolbar]',
  layoutSelect:
    '[data-test-fileDetails-dynamicScan-navigationGraph-layoutSelect]',
  roleSelect:
    '[data-test-fileDetails-dynamicScan-navigationGraph-userRoleSelect]',
  roleSkeleton:
    '[data-test-fileDetails-dynamicScan-navigationGraph-userRoleSkeleton]',
};

const TEMPLATE = hbs`
  <FileDetails::DynamicScan::NavigationGraph::NavPanel
    @file={{this.file}}
    @dynamicscanId={{this.dynamicscanId}}
    @hasGraphData={{this.hasGraphData}}
    @variantCount={{this.variantCount}}
    @transitionCount={{this.transitionCount}}
    @onLayoutChange={{this.onLayoutChange}}
  />
`;

// Creates an automated scan, optionally tied to a user role. `roleName: null`
// produces a scan with no role. `isNavigationGraphGenerated` controls whether
// the nav-panel option is enabled; defaults to true so most tests get an
// enabled option without extra setup.
function createRoleScan(
  server,
  { roleName, status, isNavigationGraphGenerated = true }
) {
  const role =
    roleName === null
      ? null
      : server.create('scenario-user-role', { name: roleName });

  return server.create('dynamicscan', {
    mode: AUTOMATED,
    status,
    scenarioUserRole: role,
    isNavigationGraphGenerated,
  });
}

// Renders and waits for the `loadUserRoleOptions` task to finish (the role
// skeleton clears) — `settled()` alone does not await the task.
async function renderPanel() {
  await render(TEMPLATE);
  await waitUntil(() => !find(SEL.roleSkeleton));
}

module(
  'Integration | Component | file-details/dynamic-scan/navigation-graph/nav-panel',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      // The component loads roles from `/last_automated_dynamic_scan` (an array
      // of scans, each with an embedded role). Graph availability is read
      // directly from `isNavigationGraphGenerated` on each scan model.
      this.server.get('/v3/files/:id/last_automated_dynamic_scan', (schema) =>
        schema.dynamicscans.all().models.map((ds) => ({
          id: ds.id,
          status: ds.status,
          mode: ds.mode,
          is_navigation_graph_generated: ds.isNavigationGraphGenerated ?? false,
          scenario_user_role: ds.scenarioUserRole
            ? { id: ds.scenarioUserRole.id, name: ds.scenarioUserRole.name }
            : null,
        }))
      );

      const store = this.owner.lookup('service:store');
      store.push({ data: { id: FILE_ID, type: 'file' } });

      this.setProperties({
        file: store.peekRecord('file', FILE_ID),
        dynamicscanId: '',
        hasGraphData: true,
        variantCount: 5,
        transitionCount: 8,
        changedLayout: null,
        onLayoutChange: (layout) => (this.changedLayout = layout),
      });
    });

    // ─── Static content ─────────────────────────────────────────────────────────

    test('renders the variant and transition counts', async function (assert) {
      await renderPanel();

      assert
        .dom(SEL.toolbar)
        .containsText(this.variantCount.toString())
        .containsText(t('navigationGraph.variants'));

      assert
        .dom(SEL.toolbar)
        .containsText(this.transitionCount.toString())
        .containsText(t('navigationGraph.transitions'));
    });

    test('renders the keyboard hints', async function (assert) {
      await renderPanel();

      assert
        .dom(SEL.toolbar)
        .containsText(t('navigationGraph.detail'))
        .containsText(t('navigationGraph.focus'))
        .containsText(t('close'))
        .containsText(t('reset'))
        .containsText(t('navigationGraph.ctrlZ'));
    });

    // ─── Layout select ──────────────────────────────────────────────────────────

    test('disables the layout select when there is no graph data', async function (assert) {
      this.set('hasGraphData', false);

      await renderPanel();

      assert
        .dom(`${SEL.layoutSelect} .ember-power-select-trigger`)
        .hasAttribute('aria-disabled', 'true');
    });

    test('enables the layout select when there is graph data', async function (assert) {
      await renderPanel();

      const trigger = find(`${SEL.layoutSelect} .ember-power-select-trigger`);

      assert.notEqual(
        trigger.getAttribute('aria-disabled'),
        'true',
        'layout select is enabled'
      );
    });

    test('calls onLayoutChange when a layout is chosen', async function (assert) {
      await renderPanel();

      await chooseAkSelectOption({
        selectTriggerClass: SEL.layoutSelect,
        labelToSelect: t('navigationGraph.breadthfirst'),
      });

      assert.strictEqual(this.changedLayout, 'breadthfirst');
    });

    // ─── Role select visibility ──────────────────────────────────────────────────

    test('hides the role select when there are no roles', async function (assert) {
      await renderPanel();

      assert.dom(SEL.roleSelect).doesNotExist();
      assert.dom(SEL.roleSkeleton).doesNotExist('skeleton gone after load');
    });

    test('hides the role select when there is only one role', async function (assert) {
      createRoleScan(this.server, {
        roleName: 'Admin',
        status: STATUS.ANALYSIS_COMPLETED,
      });

      await renderPanel();

      assert.dom(SEL.roleSelect).doesNotExist();
    });

    test('shows the role select when there are multiple roles', async function (assert) {
      const roleNames = ['Admin', 'Guest'];

      roleNames.forEach((roleName) => {
        createRoleScan(this.server, {
          roleName,
          status: STATUS.ANALYSIS_COMPLETED,
        });
      });

      await renderPanel();

      assert.dom(SEL.roleSelect).exists();

      // Sanity: both roles render as named options.
      const options = await getAllAkSelectOptions(SEL.roleSelect);

      assert.strictEqual(options.length, 2, 'one option per role');

      assert
        .dom('.ember-power-select-options')
        .containsText(roleNames[0])
        .containsText(roleNames[1]);
    });

    // ─── Role-option building ────────────────────────────────────────────────────

    test('omits scans that have no user role', async function (assert) {
      const roleNames = ['Admin', 'Guest'];

      roleNames.forEach((roleName) => {
        createRoleScan(this.server, {
          roleName,
          status: STATUS.ANALYSIS_COMPLETED,
        });
      });

      // No role — should not appear as an option.
      createRoleScan(this.server, {
        roleName: null,
        status: STATUS.ANALYSIS_COMPLETED,
      });

      await renderPanel();

      const options = await getAllAkSelectOptions(SEL.roleSelect);

      assert.strictEqual(options.length, 2, 'only role-bearing scans appear');

      assert
        .dom('.ember-power-select-options')
        .containsText(roleNames[0])
        .containsText(roleNames[1]);
    });

    test('disables the option for a role whose scan is in progress', async function (assert) {
      const roleNames = ['Admin', 'Running'];

      roleNames.forEach((roleName) => {
        createRoleScan(this.server, {
          roleName,
          status:
            roleName === 'Running'
              ? STATUS.AUTOPILOT_RUNNING
              : STATUS.ANALYSIS_COMPLETED,
        });
      });

      await renderPanel();

      const options = await getAllAkSelectOptions(SEL.roleSelect);

      const disabledOptions = options.filter(
        (option) => option.getAttribute('aria-disabled') === 'true'
      );

      assert.strictEqual(disabledOptions.length, 1, 'one role is disabled');

      assert
        .dom(disabledOptions[0])
        .containsText('Running', 'the in-progress role is disabled');

      // Hovering the disabled option reveals the reason tooltip.
      const tooltipRoot = disabledOptions[0].querySelector(
        '[data-test-ak-tooltip-root]'
      );

      await triggerEvent(tooltipRoot, 'mouseenter');

      assert
        .dom('[data-test-ak-tooltip-content]')
        .hasText(t('navigationGraph.roleScanInProgress'));
    });

    test('disables the option for a role whose scan has no navigation graph', async function (assert) {
      createRoleScan(this.server, {
        roleName: 'Admin',
        status: STATUS.ANALYSIS_COMPLETED,
      });

      // isNavigationGraphGenerated: false marks this scan as having no graph.
      createRoleScan(this.server, {
        roleName: 'NoGraph',
        status: STATUS.ANALYSIS_COMPLETED,
        isNavigationGraphGenerated: false,
      });

      await renderPanel();

      const options = await getAllAkSelectOptions(SEL.roleSelect);

      const disabledOptions = options.filter(
        (op) => op.getAttribute('aria-disabled') === 'true'
      );

      assert.strictEqual(disabledOptions.length, 1, 'one role is disabled');

      assert
        .dom(disabledOptions[0])
        .containsText('NoGraph', 'the graph-less role is disabled');

      // Hovering the disabled option reveals the reason tooltip.
      const tooltipRoot = disabledOptions[0].querySelector(
        '[data-test-ak-tooltip-root]'
      );

      await triggerEvent(tooltipRoot, 'mouseenter');

      assert
        .dom('[data-test-ak-tooltip-content]')
        .hasText(t('navigationGraph.roleNoNavigationGraph'));
    });

    test('truncates a long role label in the trigger', async function (assert) {
      const longName = 'Administrator With A Very Long Role Name';

      createRoleScan(this.server, {
        roleName: longName,
        status: STATUS.ANALYSIS_COMPLETED,
      });

      createRoleScan(this.server, {
        roleName: 'Guest',
        status: STATUS.ANALYSIS_COMPLETED,
      });

      await renderPanel();
      await getAllAkSelectOptions(SEL.roleSelect);

      assert
        .dom('.ember-power-select-options')
        .containsText(`${longName.slice(0, 27)}...`);
    });

    // ─── Role change ─────────────────────────────────────────────────────────────

    test('navigates to the chosen role on selection', async function (assert) {
      const current = createRoleScan(this.server, {
        roleName: 'Admin',
        status: STATUS.ANALYSIS_COMPLETED,
      });

      const other = createRoleScan(this.server, {
        roleName: 'Guest',
        status: STATUS.ANALYSIS_COMPLETED,
      });

      this.set('dynamicscanId', current.id);

      await renderPanel();

      await chooseAkSelectOption({
        selectTriggerClass: SEL.roleSelect,
        labelToSelect: 'Guest',
      });

      const router = this.owner.lookup('service:router');

      assert.deepEqual(router.replaceCalls[0], [
        'authenticated.dashboard.ds-navigation-graph',
        FILE_ID,
        other.id,
      ]);
    });

    test('does not navigate when the current role is re-selected', async function (assert) {
      const current = createRoleScan(this.server, {
        roleName: 'Admin',
        status: STATUS.ANALYSIS_COMPLETED,
      });

      createRoleScan(this.server, {
        roleName: 'Guest',
        status: STATUS.ANALYSIS_COMPLETED,
      });

      this.set('dynamicscanId', current.id);

      await renderPanel();

      await chooseAkSelectOption({
        selectTriggerClass: SEL.roleSelect,
        labelToSelect: 'Admin',
      });

      const router = this.owner.lookup('service:router');

      assert.strictEqual(router.replaceCalls.length, 0);
    });

    // ─── Skeleton while loading ──────────────────────────────────────────────────

    test('shows the role skeleton while roles are loading', async function (assert) {
      createRoleScan(this.server, {
        roleName: 'Admin',
        status: STATUS.ANALYSIS_COMPLETED,
      });

      this.server.get(
        '/v3/files/:id/last_automated_dynamic_scan',
        (schema) =>
          schema.dynamicscans.all().models.map((ds) => ({
            id: ds.id,
            status: ds.status,
            mode: ds.mode,

            is_navigation_graph_generated:
              ds.isNavigationGraphGenerated ?? false,

            scenario_user_role: ds.scenarioUserRole
              ? { id: ds.scenarioUserRole.id, name: ds.scenarioUserRole.name }
              : null,
          })),
        { timing: 500 }
      );

      render(TEMPLATE);

      await waitFor(SEL.roleSkeleton, { timeout: 500 });

      assert.dom(SEL.roleSkeleton).exists('skeleton shown while loading');

      await waitUntil(() => !find(SEL.roleSkeleton));

      assert.dom(SEL.roleSkeleton).doesNotExist('skeleton gone after load');
    });
  }
);
