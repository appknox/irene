import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | sbom/scan-details/component-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      // Close handler
      this.onClose = () => {};

      this.open = true;

      const store = this.owner.lookup('service:store');

      const pushStoreData = (modelName, payload) => {
        const normalized = store.normalize(modelName, payload?.toJSON());

        return store.push(normalized);
      };

      this.sbomApp = pushStoreData('sbom-app', this.server.create('sbom-app'));

      this.sbomScan = pushStoreData(
        'sbom-scan',
        this.server.create('sbom-scan')
      );

      this.sbomScanComponent = pushStoreData(
        'sbom-scan-component',
        this.server.create('sbom-scan-component', {
          id: 1,
          vulnerabilities_count: 22,
        })
      );
    });

    test('it renders', async function (assert) {
      await render(hbs`
          <Sbom::ScanDetails::ComponentDetails
            @sbomApp={{this.sbomApp}}
            @sbomScan={{this.sbomScan}}
            @sbomScanComponent={{this.sbomScanComponent}}
            @open={{this.open}}
            @onClose={{this.onClose}}
          />
      `);

      assert.dom('[data-test-componentDetails-container]').exists();
      assert.dom('[data-test-componentDetails-tabs]').exists();

      // Tests for the component details tab
      const componentDetailsTabs = [
        {
          id: 'component_details',
          label: 't:sbomModule.componentDetails:()',
        },
        {
          id: 'known_vulnerabilities',
          badgeCount: this.sbomScanComponent.vulnerabilitiesCount,
          hasBadge: true,
          label: 't:sbomModule.knownVulnerabilities:()',
        },
      ];

      componentDetailsTabs.forEach((tab) => {
        assert
          .dom(`[data-test-componentDetails-tab='${tab.id}']`)
          .exists()
          .containsText(tab.label);

        if (tab.hasBadge) {
          assert
            .dom(`[data-test-componentDetails-tab='${tab.id}']`)
            .containsText(`${tab.badgeCount}`);
        }
      });
    });

    test('it toggles the active component and drawer title when the active tab changes', async function (assert) {
      await render(hbs`
        <Sbom::ScanDetails::ComponentDetails
          @sbomApp={{this.sbomApp}}
          @sbomScan={{this.sbomScan}}
          @sbomScanComponent={{this.sbomScanComponent}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
  `);

      assert.dom('[data-test-componentDetails-container]').exists();
      assert.dom('[data-test-componentDetails-tabs]').exists();

      // Tests for the component details tab
      const componentDetailsTabs = [
        {
          id: 'component_details',
          label: 't:sbomModule.componentDetails:()',
        },
        {
          id: 'known_vulnerabilities',
          badgeCount: this.sbomScanComponent.vulnerabilitiesCount,
          hasBadge: true,
          label: 't:sbomModule.knownVulnerabilities:()',
        },
      ];

      const defaultSelectedTab = componentDetailsTabs[0];
      const tabToSelect = componentDetailsTabs[1];

      // Default active component and drawer title
      assert
        .dom(`[data-test-activeComponent='${defaultSelectedTab.label}']`)
        .exists();

      assert.dom('[data-test-drawer-title]').hasText(defaultSelectedTab.label);

      assert
        .dom(`[data-test-activeComponent='${tabToSelect.label}']`)
        .doesNotExist();

      // Select known_vulnerabilities tab
      await click(
        `[data-test-componentDetails-tab='${tabToSelect.id}'] button`
      );

      assert.dom(`[data-test-activeComponent='${tabToSelect.label}']`).exists();

      assert.dom('[data-test-drawer-title]').hasText(tabToSelect.label);

      assert
        .dom(`[data-test-activeComponent='${defaultSelectedTab.label}']`)
        .doesNotExist();
    });
  }
);
