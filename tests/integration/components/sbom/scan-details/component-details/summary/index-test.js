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
      this.sbomProject = this.server.create('sbom-project');
      this.sbomFile = this.server.create('sbom-file');

      const store = this.owner.lookup('service:store');
      const sbomComponent = this.server.create('sbom-component');

      const normalized = store.normalize(
        'sbom-component',
        sbomComponent.toJSON()
      );

      this.sbomComponent = store.push(normalized);

      await render(hbs`
          <Sbom::ScanDetails::ComponentDetails::Summary
            @sbomProject={{this.sbomProject}}
            @sbomFile={{this.sbomFile}}
            @sbomComponent={{this.sbomComponent}}
          />
      `);

      assert
        .dom('[data-test-sbomScanDetails-componentDetails-summary]')
        .exists();

      // Tests for the component details tab
      const componentSummaryList = [
        {
          label: 't:sbomModule.componentName:()',
          value: this.sbomComponent.name,
        },
        {
          label: 't:sbomModule.componentType:()',
          value: capitalize(this.sbomComponent.type),
        },
        {
          label: 't:version:()',
          value: this.sbomComponent.version,
        },
        {
          label: 't:sbomModule.latestVersion:()',
          value: this.sbomComponent.latestVersion,
        },
        {
          label: 't:author:()',
          value: this.sbomComponent.author,
        },
        {
          label: 't:license:()',
          value: this.sbomComponent.licenses.join(', '),
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
      //   .hasText(this.sbomComponent.remediation);
    });
  }
);
