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

module(
  'Integration | Component | storeknox/third-party-scans/header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      this.setProperties({
        selectedStore: 'appstore',
        selectedRegion: 'US',
        selectedRiskStatus: -1,
        filterQuery: '',
        regionsOpted: ['US', 'IN'],
      });
    });

    test('it renders title, description, search and filters', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::Header
          @selectedStore={{this.selectedStore}}
          @selectedRegion={{this.selectedRegion}}
          @selectedRiskStatus={{this.selectedRiskStatus}}
          @filterQuery={{this.filterQuery}}
          @regionsOpted={{this.regionsOpted}}
        />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansHeader-title]')
        .hasText(t('storeknox.thirdPartyScansTitle'));

      assert
        .dom('[data-test-storeknoxThirdPartyScansHeader-description]')
        .hasText(t('storeknox.thirdPartyScansDescription'));

      assert
        .dom('input[data-test-storeknoxThirdPartyScansHeader-searchInput]')
        .exists();

      assert
        .dom('[data-test-storeknoxThirdPartyScansHeader-storeSelect]')
        .exists()
        .containsText(t('storeknox.appStore'));

      assert
        .dom('[data-test-storeknoxThirdPartyScansHeader-regionSelect]')
        .exists()
        .containsText('US');

      assert
        .dom('[data-test-storeknoxThirdPartyScansHeader-riskStatusSelect]')
        .exists()
        .containsText(t('all'));
    });

    test('it shows a region chip instead of the filter when only one region is opted', async function (assert) {
      this.set('regionsOpted', ['US']);

      await render(hbs`
        <Storeknox::ThirdPartyScans::Header
          @selectedStore={{this.selectedStore}}
          @selectedRegion={{this.selectedRegion}}
          @selectedRiskStatus={{this.selectedRiskStatus}}
          @filterQuery={{this.filterQuery}}
          @regionsOpted={{this.regionsOpted}}
        />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansHeader-regionSelect]')
        .doesNotExist();

      assert
        .dom('[data-test-storeknoxThirdPartyScansHeader-regionChip]')
        .hasText(`${t('storeknox.region')} - US`);
    });

    test('it hides region filter when no regions are opted', async function (assert) {
      this.set('regionsOpted', []);

      await render(hbs`
        <Storeknox::ThirdPartyScans::Header
          @selectedStore={{this.selectedStore}}
          @selectedRegion={{this.selectedRegion}}
          @selectedRiskStatus={{this.selectedRiskStatus}}
          @filterQuery={{this.filterQuery}}
          @regionsOpted={{this.regionsOpted}}
        />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansHeader-regionSelect]')
        .doesNotExist();
    });

    test('it transitions with tp_store query param on store change', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::Header
          @selectedStore={{this.selectedStore}}
          @selectedRegion={{this.selectedRegion}}
          @selectedRiskStatus={{this.selectedRiskStatus}}
          @filterQuery={{this.filterQuery}}
          @regionsOpted={{this.regionsOpted}}
        />
      `);

      await selectChoose(
        '[data-test-storeknoxThirdPartyScansHeader-storeSelect]',
        '.ember-power-select-option',
        1
      );

      const router = this.owner.lookup('service:router');

      assert.deepEqual(router.lastTransition, {
        queryParams: { tp_store: 'playstore', tp_offset: 0 },
      });
    });

    test('it transitions with tp_region query param on region change', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::Header
          @selectedStore={{this.selectedStore}}
          @selectedRegion={{this.selectedRegion}}
          @selectedRiskStatus={{this.selectedRiskStatus}}
          @filterQuery={{this.filterQuery}}
          @regionsOpted={{this.regionsOpted}}
        />
      `);

      await selectChoose(
        '[data-test-storeknoxThirdPartyScansHeader-regionSelect]',
        '.ember-power-select-option',
        1
      );

      const router = this.owner.lookup('service:router');

      assert.deepEqual(router.lastTransition, {
        queryParams: { tp_region: 'IN', tp_offset: 0 },
      });
    });

    test('it transitions with tp_risk_status query param on risk status change', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::Header
          @selectedStore={{this.selectedStore}}
          @selectedRegion={{this.selectedRegion}}
          @selectedRiskStatus={{this.selectedRiskStatus}}
          @filterQuery={{this.filterQuery}}
          @regionsOpted={{this.regionsOpted}}
        />
      `);

      await selectChoose(
        '[data-test-storeknoxThirdPartyScansHeader-riskStatusSelect]',
        '.ember-power-select-option',
        3
      );

      const router = this.owner.lookup('service:router');

      assert.deepEqual(router.lastTransition, {
        queryParams: { tp_risk_status: 2, tp_offset: 0 },
      });
    });

    test('it commits the search query with tp_filter after debounce', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::Header
          @selectedStore={{this.selectedStore}}
          @selectedRegion={{this.selectedRegion}}
          @selectedRiskStatus={{this.selectedRiskStatus}}
          @filterQuery={{this.filterQuery}}
          @regionsOpted={{this.regionsOpted}}
        />
      `);

      await fillIn(
        'input[data-test-storeknoxThirdPartyScansHeader-searchInput]',
        'facebook'
      );

      const router = this.owner.lookup('service:router');

      assert.deepEqual(router.lastTransition, {
        queryParams: { tp_filter: 'facebook', tp_offset: 0 },
      });
    });
  }
);
