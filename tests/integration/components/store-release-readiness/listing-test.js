import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { render, click, fillIn, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { selectChoose } from 'ember-power-select/test-support';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

class OrganizationStub extends Service {
  selected = {
    id: 1,
    features: {
      store_release_readiness: true,
    },
  };
}

module('Integration | Component | store-release-readiness', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');
  setupBrowserFakes(hooks, { window: true, localStorage: true });

  hooks.beforeEach(async function () {
    class RouterStub extends Service {
      testContext = null;

      transitionTo(options) {
        const ctx = this.testContext;

        if (!options?.queryParams || !ctx?.queryParams) {
          return;
        }

        const next = { ...ctx.queryParams };

        for (const [key, value] of Object.entries(options.queryParams)) {
          if (value === null || value === undefined) {
            if (key === 'app_query') {
              next[key] = '';
            } else if (key === 'app_platform' || key === 'app_rejection_risk') {
              next[key] = '-1';
            }
          } else {
            next[key] = String(value);
          }
        }

        ctx.set('queryParams', next);
      }
    }

    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:organization', OrganizationStub);
    this.owner.unregister('service:router');
    this.owner.register('service:router', RouterStub);

    this.owner.lookup('service:router').testContext = this;

    const window = this.owner.lookup('service:browser/window');
    window.localStorage.clear();

    const scans = [
      this.server.create('store-release-readiness-scan', {
        package_name: 'com.acme.alpha',
        platform: ENUMS.PLATFORM.ANDROID,
        verdict: ENUMS.STORE_RELEASE_VERDICT.HIGH_REJECTION_RISK,
      }),
      this.server.create('store-release-readiness-scan', {
        package_name: 'com.acme.beta',
        platform: ENUMS.PLATFORM.ANDROID,
        verdict: ENUMS.STORE_RELEASE_VERDICT.MODERATE_REJECTION_RISK,
      }),
      this.server.create('store-release-readiness-scan', {
        package_name: 'com.acme.gamma',
        platform: ENUMS.PLATFORM.IOS,
        verdict: ENUMS.STORE_RELEASE_VERDICT.LOW_REJECTION_RISK,
      }),
      this.server.create('store-release-readiness-scan', {
        package_name: 'com.acme.delta',
        platform: ENUMS.PLATFORM.IOS,
        verdict: ENUMS.STORE_RELEASE_VERDICT.HIGH_REJECTION_RISK,
      }),
      this.server.create('store-release-readiness-scan', {
        package_name: 'com.acme.epsilon',
        platform: ENUMS.PLATFORM.ANDROID,
        verdict: ENUMS.STORE_RELEASE_VERDICT.LOW_REJECTION_RISK,
      }),
    ];

    this.server.get('/v2/store-release-readiness/scans', (schema, req) => {
      const search = req.queryParams.search;
      const platform = req.queryParams.platform;
      const verdict = req.queryParams.verdict;

      this.set('lastQueryParams', {
        search,
        platform,
        verdict,
      });

      let results = schema.storeReleaseReadinessScans.all().models;

      if (search) {
        results = results.filter((s) =>
          (s.package_name || '').toLowerCase().includes(search.toLowerCase())
        );
      }

      if (platform !== undefined) {
        results = results.filter((s) => s.platform === Number(platform));
      }

      if (verdict !== undefined) {
        results = results.filter((s) => s.verdict === Number(verdict));
      }

      return {
        count: results.length,
        next: null,
        previous: null,
        results,
      };
    });

    this.setProperties({
      scans,
      queryParams: {
        app_limit: '12',
        app_offset: '0',
        app_query: '',
        app_platform: '-1',
        app_rejection_risk: '-1',
      },
    });
  });

  test('it renders the listing page with header, cards & data-test selectors', async function (assert) {
    await render(
      hbs`<StoreReleaseReadiness @queryParams={{this.queryParams}} />`
    );

    assert
      .dom('[data-test-store-release-readiness-title]')
      .exists()
      .hasText(t('storeReleaseReadiness.pageTitle'));

    assert
      .dom('[data-test-store-release-readiness-description]')
      .exists()
      .hasText(t('storeReleaseReadiness.pageDescription'));

    assert
      .dom('[data-test-store-release-readiness-search-input]')
      .exists()
      .isNotDisabled()
      .hasNoValue();

    assert.dom('[data-test-store-release-readiness-platform-select]').exists();

    assert
      .dom('[data-test-store-release-readiness-rejection-risk-select]')
      .exists();

    assert
      .dom('[data-test-store-release-readiness-clear-filter]')
      .doesNotExist();

    assert.dom('[data-test-store-release-readiness-status]').doesNotExist();

    const cards = findAll('[data-test-store-release-readiness-card-link]');

    assert.strictEqual(
      cards.length,
      this.scans.length,
      'Renders one card per scan'
    );

    this.scans.forEach((scan) => {
      assert
        .dom(`[data-test-store-release-readiness-card-link="${scan.id}"]`)
        .exists(`renders card link for scan ${scan.id}`);

      assert
        .dom(
          `[data-test-store-release-readiness-card-link="${scan.id}"] [data-test-store-release-readiness-card-id="${scan.id}"]`
        )
        .exists(`card id matches scan ${scan.id}`);

      assert
        .dom(
          `[data-test-store-release-readiness-card-link="${scan.id}"] [data-test-store-release-readiness-package-name]`
        )
        .hasText(scan.package_name, `renders package name for scan ${scan.id}`);
    });
  });

  test('it filters list when search query changes', async function (assert) {
    await render(
      hbs`<StoreReleaseReadiness @queryParams={{this.queryParams}} />`
    );

    assert
      .dom('[data-test-store-release-readiness-card-link]')
      .exists({ count: this.scans.length });

    await fillIn('[data-test-store-release-readiness-search-input]', 'alpha');

    assert.strictEqual(
      this.lastQueryParams.search,
      'alpha',
      'Server receives the search query'
    );

    assert
      .dom('[data-test-store-release-readiness-card-link]')
      .exists({ count: 1 }, 'Only one card matches the search');

    await fillIn('[data-test-store-release-readiness-search-input]', '');

    assert
      .dom('[data-test-store-release-readiness-card-link]')
      .exists(
        { count: this.scans.length },
        'All cards return when search is cleared'
      );
  });

  test('it filters by platform and clears it', async function (assert) {
    await render(
      hbs`<StoreReleaseReadiness @queryParams={{this.queryParams}} />`
    );

    const androidCount = this.scans.filter(
      (s) => s.platform === ENUMS.PLATFORM.ANDROID
    ).length;

    await selectChoose(
      '[data-test-store-release-readiness-platform-select]',
      t('android')
    );

    assert.strictEqual(
      this.lastQueryParams.platform,
      String(ENUMS.PLATFORM.ANDROID),
      'Server receives the platform filter value'
    );

    assert
      .dom('[data-test-store-release-readiness-card-link]')
      .exists({ count: androidCount }, 'Cards filtered to android scans');

    assert
      .dom('[data-test-store-release-readiness-clear-filter]')
      .exists('Clear-filter button visible after applying a filter');

    await click('[data-test-store-release-readiness-clear-filter]');

    assert
      .dom('[data-test-store-release-readiness-clear-filter]')
      .doesNotExist('Clear-filter button hides after clearing');

    assert
      .dom('[data-test-store-release-readiness-card-link]')
      .exists(
        { count: this.scans.length },
        'All cards return after clearing filters'
      );
  });

  test('it filters by rejection risk and clears it', async function (assert) {
    await render(
      hbs`<StoreReleaseReadiness @queryParams={{this.queryParams}} />`
    );

    const highRiskCount = this.scans.filter(
      (s) => s.verdict === ENUMS.STORE_RELEASE_VERDICT.HIGH_REJECTION_RISK
    ).length;

    await selectChoose(
      '[data-test-store-release-readiness-rejection-risk-select]',
      t('high')
    );

    assert.strictEqual(
      this.lastQueryParams.verdict,
      String(ENUMS.STORE_RELEASE_VERDICT.HIGH_REJECTION_RISK),
      'Server receives the rejection risk filter value'
    );

    assert
      .dom('[data-test-store-release-readiness-card-link]')
      .exists({ count: highRiskCount }, 'Cards filtered to high-risk scans');

    assert
      .dom('[data-test-store-release-readiness-clear-filter]')
      .exists('Clear-filter button visible after applying a filter');

    await click('[data-test-store-release-readiness-clear-filter]');

    assert
      .dom('[data-test-store-release-readiness-clear-filter]')
      .doesNotExist('Clear-filter button hides after clearing');

    assert
      .dom('[data-test-store-release-readiness-card-link]')
      .exists(
        { count: this.scans.length },
        'All cards return after clearing filters'
      );
  });

  test('it shows the no-results empty state when filter yields zero', async function (assert) {
    this.server.get('/v2/store-release-readiness/scans', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.set('queryParams', {
      ...this.queryParams,
      app_platform: String(ENUMS.PLATFORM.ANDROID),
    });

    await render(
      hbs`<StoreReleaseReadiness @queryParams={{this.queryParams}} />`
    );

    assert
      .dom('[data-test-store-release-readiness-status]')
      .exists('Empty state shown');

    assert
      .dom('[data-test-store-release-readiness-status-heading]')
      .hasText(t('noResultsFound'));

    assert
      .dom('[data-test-store-release-readiness-status-description]')
      .hasText(t('tryAdjustingFilter'));

    assert.dom('[data-test-store-release-readiness-card-link]').doesNotExist();
  });

  test('it shows the empty state when no scans exist', async function (assert) {
    this.server.get('/v2/store-release-readiness/scans', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    await render(
      hbs`<StoreReleaseReadiness @queryParams={{this.queryParams}} />`
    );

    assert
      .dom('[data-test-store-release-readiness-status]')
      .exists('Empty state shown');

    assert
      .dom('[data-test-store-release-readiness-status-heading]')
      .hasText(t('storeReleaseReadiness.listEmptyHeader'));

    assert
      .dom('[data-test-store-release-readiness-status-description]')
      .hasText(t('storeReleaseReadiness.listEmptyDescription'));

    assert.dom('[data-test-store-release-readiness-card-link]').doesNotExist();
  });

  test('it shows the upselling page when feature is toggled off', async function (assert) {
    this.set('isStoreReleaseReadinessEnabled', false);

    await render(hbs`
        {{#if this.isStoreReleaseReadinessEnabled}}
          <StoreReleaseReadiness @queryParams={{this.queryParams}} />
        {{else}}
          <StoreReleaseReadiness::Upselling />
        {{/if}}
      `);

    assert.dom('[data-test-upselling-module]').exists();

    assert
      .dom('[data-test-upselling-module-title]')
      .hasText(t('storeReleaseReadiness.introducing'));

    assert
      .dom('[data-test-upselling-module-subtitle]')
      .hasText(t('storeReleaseReadiness.overview'));

    assert.dom('[data-test-upselling-module-feature]').exists({ count: 3 });

    assert.dom('[data-test-upselling-module-contact-cta]').exists();

    assert
      .dom('[data-test-store-release-readiness-title]')
      .doesNotExist('Listing header is hidden when feature is off');

    assert
      .dom('[data-test-store-release-readiness-card-link]')
      .doesNotExist('Cards are not rendered when feature is off');

    assert
      .dom('[data-test-store-release-readiness-status]')
      .doesNotExist('Empty state is not rendered when feature is off');
  });
});
