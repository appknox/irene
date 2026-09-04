import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { selectChoose } from 'ember-power-select/test-support';
import Service from '@ember/service';

class RouterStub extends Service {
  lastTransition = null;

  transitionTo(options) {
    this.lastTransition = options;
  }
}

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  title: '[data-test-storeknoxThirdPartyScansHeader-title]',
  description: '[data-test-storeknoxThirdPartyScansHeader-description]',
  searchInput: 'input[data-test-storeknoxThirdPartyScansHeader-searchInput]',
  storeSelect: '[data-test-storeknoxThirdPartyScansHeader-storeSelect]',
  regionSelect: '[data-test-storeknoxThirdPartyScansHeader-regionSelect]',
  regionChip: '[data-test-storeknoxThirdPartyScansHeader-regionChip]',
  riskStatusSelect:
    '[data-test-storeknoxThirdPartyScansHeader-riskStatusSelect]',
  powerSelectOption: '.ember-power-select-option',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <Storeknox::ThirdPartyScans::Header
    @selectedStore={{this.selectedStore}}
    @selectedRegion={{this.selectedRegion}}
    @selectedRiskStatus={{this.selectedRiskStatus}}
    @filterQuery={{this.filterQuery}}
    @appstoreRegionsOpted={{this.appstoreRegionsOpted}}
    @playstoreRegionsOpted={{this.playstoreRegionsOpted}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────
module(
  'Integration | Component | storeknox/third-party-scans/header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      this.router = this.owner.lookup('service:router');

      this.setProperties({
        selectedStore: 'appstore',
        selectedRegion: 'US',
        selectedRiskStatus: -1,
        filterQuery: '',
        appstoreRegionsOpted: ['US', 'IN'],
        playstoreRegionsOpted: ['US'],
      });
    });

    // ─── Layout ──────────────────────────────────────────────────────────────────
    test('it renders the title, description, search and filters', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.title).hasText(t('storeknox.thirdPartyScansTitle'));

      assert
        .dom(selectors.description)
        .hasText(t('storeknox.thirdPartyScansDescription'));

      assert.dom(selectors.searchInput).exists();

      assert.dom(selectors.storeSelect).containsText(t('storeknox.appStore'));

      assert
        .dom(selectors.regionSelect)
        .containsText(t('storeknox.regionNames.US'));

      assert.dom(selectors.riskStatusSelect).containsText(t('all'));
    });

    // ─── Store filter ────────────────────────────────────────────────────────────
    test('it shows the store filter when both stores have opted regions', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.storeSelect).containsText(t('storeknox.appStore'));
    });

    test('it hides the store filter when a store has no opted regions', async function (assert) {
      this.set('appstoreRegionsOpted', []);

      await render(TEMPLATE);

      assert.dom(selectors.storeSelect).doesNotExist();
    });

    test('it transitions with the tp_store query param on store change', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(this.router.lastTransition, null);

      await selectChoose(selectors.storeSelect, selectors.powerSelectOption, 1);

      assert.deepEqual(this.router.lastTransition, {
        queryParams: { tp_store: 'playstore', tp_region: '', tp_offset: 0 },
      });
    });

    // ─── Region filter ───────────────────────────────────────────────────────────
    test('it shows the region filter when the store has more than one opted region', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.regionSelect)
        .containsText(t('storeknox.regionNames.US'));

      assert.dom(selectors.regionChip).doesNotExist();
    });

    test('it shows a region chip instead of the filter when the store has a single opted region', async function (assert) {
      this.set('appstoreRegionsOpted', ['US']);

      await render(TEMPLATE);

      assert.dom(selectors.regionSelect).doesNotExist();

      assert
        .dom(selectors.regionChip)
        .hasText(`${t('storeknox.region')} - ${t('storeknox.regionNames.US')}`);
    });

    test('it shows neither region filter nor chip when the store has no opted regions', async function (assert) {
      this.set('appstoreRegionsOpted', []);

      await render(TEMPLATE);

      assert.dom(selectors.regionSelect).doesNotExist();
      assert.dom(selectors.regionChip).doesNotExist();
    });

    test('it transitions with the tp_region query param on region change', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(this.router.lastTransition, null);

      await selectChoose(
        selectors.regionSelect,
        selectors.powerSelectOption,
        1
      );

      assert.deepEqual(this.router.lastTransition, {
        queryParams: { tp_region: 'IN', tp_offset: 0 },
      });
    });

    // ─── Risk status filter ──────────────────────────────────────────────────────
    test('it transitions with the tp_risk_status query param on risk status change', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(this.router.lastTransition, null);

      await selectChoose(
        selectors.riskStatusSelect,
        selectors.powerSelectOption,
        3
      );

      assert.deepEqual(this.router.lastTransition, {
        queryParams: { tp_risk_status: 2, tp_offset: 0 },
      });
    });

    // ─── Search ──────────────────────────────────────────────────────────────────
    test('it commits the search query with the tp_filter query param after debounce', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(this.router.lastTransition, null);

      await fillIn(selectors.searchInput, 'facebook');

      assert.deepEqual(this.router.lastTransition, {
        queryParams: { tp_filter: 'facebook', tp_offset: 0 },
      });
    });
  }
);
