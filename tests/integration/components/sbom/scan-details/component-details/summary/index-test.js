import { capitalize } from '@ember/string';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | sbom/scan-details/component-details/summary',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    test('it renders component details summary correctly', async function (assert) {
      this.sbomApp = this.server.create('sbom-app');
      this.sbomScan = this.server.create('sbom-scan');

      const store = this.owner.lookup('service:store');
      const sbomScanComponent = this.server.create('sbom-scan-component');

      const normalized = store.normalize(
        'sbom-scan-component',
        sbomScanComponent.toJSON()
      );

      this.sbomScanComponent = store.push(normalized);

      await render(hbs`
          <Sbom::ScanDetails::ComponentDetails::Summary
            @sbomApp={{this.sbomApp}}
            @sbomScan={{this.sbomScan}}
            @sbomScanComponent={{this.sbomScanComponent}}
          />
      `);

      assert
        .dom('[data-test-sbomScanDetails-componentDetails-summary]')
        .exists();

      // Tests for the component details tab
      const componentSummaryList = [
        {
          label: 't:sbomModule.componentName:()',
          value: this.sbomScanComponent.name,
        },
        {
          label: 't:sbomModule.componentType:()',
          value: capitalize(this.sbomScanComponent.type),
        },
        {
          label: 't:version:()',
          value: this.sbomScanComponent.version,
        },
        {
          label: 't:sbomModule.latestVersion:()',
          value: this.sbomScanComponent.latestVersion,
        },
        {
          label: 't:author:()',
          value: this.sbomScanComponent.author,
        },
        {
          label: 't:license:()',
          value: this.sbomScanComponent.licenses.join(', '),
        },
      ];

      componentSummaryList.forEach((summary) => {
        assert
          .dom(
            `[data-test-sbomScanDetails-componentDetails-summary="${summary.label}"]`
          )
          .exists()
          .containsText(summary.label)
          .containsText(summary.value);
      });

      // assert
      //   .dom('[data-test-sbomScanDetails-componentDetails-howToFixTitle]')
      //   .hasText('t:howToFix:()');

      // assert
      //   .dom('[data-test-sbomScanDetails-componentDetails-howToFixRemedy]')
      //   .hasText(this.sbomScanComponent.remediation);
    });
  }
);
