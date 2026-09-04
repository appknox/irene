import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { render, click, fillIn, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

const SCAN_STATUS = ENUMS.OFFSEC_SCAN_STATUS;

// ─── Stubs ───────────────────────────────────────────────────────────────────

class NotificationsStub extends Service {
  errorMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success() {}
}

class RouterStub extends Service {
  lastRoute = null;
  lastModels = [];

  // The component pushes filter/search/sort state into the URL. The test binds
  // this back onto `this.queryParams` so the round trip actually re-renders.
  onQueryParamsChange = null;

  transitionTo(routeOrOptions, ...models) {
    if (
      typeof routeOrOptions === 'object' &&
      routeOrOptions !== null &&
      routeOrOptions.queryParams
    ) {
      this.onQueryParamsChange?.(routeOrOptions.queryParams);

      return;
    }

    this.lastRoute = routeOrOptions;
    this.lastModels = models;
  }

  // Ak* components consult the router service while rendering; without these the
  // stub throws before the assertion runs.
  hasRoute() {
    return true;
  }

  urlFor() {
    return '';
  }

  isActive() {
    return false;
  }
}

// ─── Selectors ───────────────────────────────────────────────────────────────

const SELECTORS = {
  table: '[data-test-offensiveSecurity-attackRuns-table]',
  row: '[data-test-offensiveSecurity-attackRuns-row]',
  // AkTextField splats ...attributes onto the <Input> itself.
  search: 'input[data-test-offensiveSecurity-attackRuns-search]',
  overline: '[data-test-offensiveSecurity-attackRuns-overline]',
  targetCell: '[data-test-offensiveSecurity-attackRuns-targetCell]',
  resilienceBadge: '[data-test-offensiveSecurity-attackRuns-resilienceBadge]',
  resilienceEmpty: '[data-test-offensiveSecurity-attackRuns-resilienceEmpty]',
  emptyState: '[data-test-offensiveSecurity-attackRuns-emptyState]',
  noMatches: '[data-test-offensiveSecurity-attackRuns-noMatches]',
  sortToggle: '[data-test-offensiveSecurity-attackRuns-dateHeader-sortToggle]',
  platformFilterIcon:
    '[data-test-offensiveSecurity-attackRuns-platformHeader-icon]',
  platformOption: (value) =>
    `[data-test-offensiveSecurity-attackRuns-platformHeader-option='${value}']`,
  resilienceFilterIcon:
    '[data-test-offensiveSecurity-attackRuns-resilienceHeader-icon]',
  resilienceOption: (value) =>
    `[data-test-offensiveSecurity-attackRuns-resilienceHeader-option='${value}']`,
  actionBtn: (id) =>
    `[data-test-offensiveSecurity-attackRuns-actionBtn='${id}']`,
  // AkList::Item splats attributes onto the <li>; the handler sits on its <button>.
  viewResults: '[data-test-offensiveSecurity-attackRuns-viewResults] button',
};

const TEMPLATE = hbs`<OffensiveSecurity::AttackRuns
  @queryParams={{this.queryParams}}
/>`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function serveScans(test, scans) {
  test.server.get('/v2/offsec/scans', () => ({
    count: scans.length,
    next: null,
    previous: null,
    results: scans,
  }));
  test.server.get('/submissions', () => []);
}

function buildScan(overrides = {}) {
  return {
    id: 1,
    file_id: 1,
    project_id: 1,
    package_name: 'com.example.app',
    app_name: 'Example App',
    version: '1.0.0',
    platform: 'android',
    status: SCAN_STATUS.COMPLETED,
    status_reason: '',
    risk_rating: 'HIGH',
    overall_resilience: 40,
    resilience_band: 'weak',
    protections_detected: 5,
    protections_bypassed: 3,
    findings_assessed: 5,
    findings_unassessed: 0,
    completed_at: '2026-08-01T10:00:00Z',
    created_at: '2026-08-01T09:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
    ...overrides,
  };
}

module('Integration | Component | offensive-security/attack-runs', (hooks) => {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');
  setupBrowserFakes(hooks, { window: true });

  hooks.beforeEach(function () {
    this.owner.register('service:notifications', NotificationsStub);
    // Ember pre-registers the real router service; it must be removed or the
    // component keeps resolving it and transitionTo throws.
    this.owner.unregister('service:router');
    this.owner.register('service:router', RouterStub);

    this.set('queryParams', {
      scan_limit: 25,
      scan_offset: 0,
      scan_query: '',
      scan_platform: 'all',
      scan_resilience: 'all',
      scan_sort: 'desc',
    });

    this.owner.lookup('service:router').onQueryParamsChange = (queryParams) => {
      this.set('queryParams', { ...queryParams });
    };
  });

  // ─── Rendering ─────────────────────────────────────────────────────────────

  test('it lists the scans returned by the API', async function (assert) {
    serveScans(this, [
      buildScan({ id: 1, app_name: 'Alpha App' }),
      buildScan({ id: 2, app_name: 'Beta App' }),
    ]);

    await render(TEMPLATE);

    assert.dom(SELECTORS.table).exists();
    assert.strictEqual(findAll(SELECTORS.row).length, 2);
  });

  test('it renders the scan-targets header', async function (assert) {
    serveScans(this, [buildScan()]);

    await render(TEMPLATE);

    assert
      .dom(SELECTORS.overline)
      .hasText(t('offensiveSecurity.aiRedTeamOverline'));
  });

  test('the target column shows the friendly app name', async function (assert) {
    serveScans(this, [
      buildScan({
        app_name: 'Consumer Banking App',
        package_name: 'com.cb.app',
      }),
    ]);

    await render(TEMPLATE);

    assert.dom(SELECTORS.targetCell).hasText('Consumer Banking App');
  });

  test('the target column falls back to the package name', async function (assert) {
    // app_name is not on the API payload yet, so the fallback is the live path.
    serveScans(this, [
      buildScan({ app_name: '', package_name: 'com.example.app' }),
    ]);

    await render(TEMPLATE);

    assert.dom(SELECTORS.targetCell).hasText('com.example.app');
  });

  test('the version column renders the build version', async function (assert) {
    serveScans(this, [buildScan({ version: '4.12.0' })]);

    await render(TEMPLATE);

    assert.dom(SELECTORS.row).containsText('4.12.0');
  });

  test('it shows an empty state when no scans exist', async function (assert) {
    serveScans(this, []);

    await render(TEMPLATE);

    assert
      .dom(SELECTORS.emptyState)
      .containsText(t('offensiveSecurity.noTargetsYet'));
  });

  // ─── Resilience pill ───────────────────────────────────────────────────────

  test('a completed scan shows the resilience score and band', async function (assert) {
    serveScans(this, [
      buildScan({ status: SCAN_STATUS.COMPLETED, overall_resilience: 67 }),
    ]);

    await render(TEMPLATE);

    assert.dom(SELECTORS.resilienceBadge).containsText('67/100');

    assert
      .dom(SELECTORS.resilienceBadge)
      .containsText(t('offensiveSecurity.resilienceLevel.medium'));
  });

  test('a high score reads as strong', async function (assert) {
    serveScans(this, [
      buildScan({ status: SCAN_STATUS.COMPLETED, overall_resilience: 91 }),
    ]);

    await render(TEMPLATE);

    assert.dom(SELECTORS.resilienceBadge).containsText('91/100');

    assert
      .dom(SELECTORS.resilienceBadge)
      .containsText(t('offensiveSecurity.resilienceLevel.strong'));
  });

  test('a low score reads as weak', async function (assert) {
    serveScans(this, [
      buildScan({ status: SCAN_STATUS.COMPLETED, overall_resilience: 35 }),
    ]);

    await render(TEMPLATE);

    assert
      .dom(SELECTORS.resilienceBadge)
      .containsText(t('offensiveSecurity.resilienceLevel.weak'));
  });

  test('a running scan shows no resilience pill', async function (assert) {
    // Resilience is only scored once the run has finished.
    serveScans(this, [buildScan({ status: SCAN_STATUS.RUNNING })]);

    await render(TEMPLATE);

    assert.dom(SELECTORS.resilienceBadge).doesNotExist();
    assert.dom(SELECTORS.resilienceEmpty).exists();
    assert.dom('[data-test-offensiveSecurity-statusChip-running]').exists();
  });

  test('a completed but unscored scan shows no resilience pill', async function (assert) {
    serveScans(this, [
      buildScan({ status: SCAN_STATUS.COMPLETED, overall_resilience: null }),
    ]);

    await render(TEMPLATE);

    assert.dom(SELECTORS.resilienceBadge).doesNotExist();
    assert.dom(SELECTORS.resilienceEmpty).exists();
  });

  // ─── Filtering ─────────────────────────────────────────────────────────────

  test('searching narrows the rows by target name', async function (assert) {
    serveScans(this, [
      buildScan({ id: 1, app_name: 'Alpha App' }),
      buildScan({ id: 2, app_name: 'Beta App' }),
    ]);

    await render(TEMPLATE);
    await fillIn(SELECTORS.search, 'alpha');

    assert.strictEqual(findAll(SELECTORS.row).length, 1);
    assert.dom(SELECTORS.row).containsText('Alpha App');
  });

  test('a search matching nothing shows the no-matches state', async function (assert) {
    serveScans(this, [buildScan({ app_name: 'Alpha App' })]);

    await render(TEMPLATE);
    await fillIn(SELECTORS.search, 'nothing-matches-this');

    assert.dom(SELECTORS.noMatches).exists();
    assert.strictEqual(findAll(SELECTORS.row).length, 0);
  });

  test('the platform header filter narrows to one platform', async function (assert) {
    serveScans(this, [
      buildScan({ id: 1, app_name: 'Droid App', platform: 'android' }),
      buildScan({ id: 2, app_name: 'Fruit App', platform: 'ios' }),
    ]);

    await render(TEMPLATE);

    assert.strictEqual(findAll(SELECTORS.row).length, 2);

    await click(SELECTORS.platformFilterIcon);
    await click(SELECTORS.platformOption('ios'));

    assert.strictEqual(findAll(SELECTORS.row).length, 1);
    assert.dom(SELECTORS.row).containsText('Fruit App');
  });

  test('the resilience header filter narrows by band', async function (assert) {
    serveScans(this, [
      buildScan({ id: 1, app_name: 'Weak App', overall_resilience: 20 }),
      buildScan({ id: 2, app_name: 'Strong App', overall_resilience: 91 }),
    ]);

    await render(TEMPLATE);

    assert.strictEqual(findAll(SELECTORS.row).length, 2);

    await click(SELECTORS.resilienceFilterIcon);
    await click(SELECTORS.resilienceOption('strong'));

    assert.strictEqual(findAll(SELECTORS.row).length, 1);
    assert.dom(SELECTORS.row).containsText('Strong App');
  });

  // ─── Sorting ───────────────────────────────────────────────────────────────

  test('toggling the date sort reverses the row order', async function (assert) {
    serveScans(this, [
      buildScan({
        id: 1,
        app_name: 'Older App',
        created_at: '2026-07-01T09:00:00Z',
        completed_at: '2026-07-01T10:00:00Z',
      }),
      buildScan({
        id: 2,
        app_name: 'Newer App',
        created_at: '2026-08-01T09:00:00Z',
        completed_at: '2026-08-01T10:00:00Z',
      }),
    ]);

    await render(TEMPLATE);

    // Defaults to most recent first.
    assert.dom(findAll(SELECTORS.row)[0]).containsText('Newer App');

    await click(SELECTORS.sortToggle);

    assert.dom(findAll(SELECTORS.row)[0]).containsText('Older App');
  });

  // ─── Interaction ───────────────────────────────────────────────────────────

  test('clicking a row transitions to that scan', async function (assert) {
    serveScans(this, [buildScan({ id: 7 })]);

    await render(TEMPLATE);
    await click(SELECTORS.row);

    const router = this.owner.lookup('service:router');

    assert.strictEqual(
      router.lastRoute,
      'authenticated.dashboard.offensive-security.scan'
    );

    assert.deepEqual(router.lastModels, ['7']);
  });

  test('the row action menu navigates without the row click firing too', async function (assert) {
    serveScans(this, [buildScan({ id: 7 })]);

    await render(TEMPLATE);

    const router = this.owner.lookup('service:router');

    // Opening the menu must not navigate — the row underneath is clickable.
    await click(SELECTORS.actionBtn(7));

    assert.strictEqual(router.lastRoute, null);

    await click(SELECTORS.viewResults);

    assert.strictEqual(
      router.lastRoute,
      'authenticated.dashboard.offensive-security.scan'
    );

    assert.deepEqual(router.lastModels, ['7']);
  });
});
