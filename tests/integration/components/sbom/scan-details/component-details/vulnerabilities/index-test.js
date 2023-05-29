import { findAll, waitFor, find, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { VulnerabilitySeverity } from 'irene/models/sbom-scan-component-vulnerability';

module(
  'Integration | Component | sbom/scan-details/component-details/vulnerabilities',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.sbomApp = this.server.create('sbom-app');

      this.sbomScan = this.server.create('sbom-scan');

      this.sbomScanComponent = this.server.create('sbom-scan-component', {
        id: 1,
      });
    });

    test('tests loading and empty states for sbom component vunerabilities', async function (assert) {
      this.server.get(
        '/v2/sb_components/:comp_id/sb_vulnerability_audits',
        () => {
          return { count: 0, next: null, previous: null, results: [] };
        },
        { timing: 500 }
      );

      render(hbs`
        <Sbom::ScanDetails::ComponentDetails::Vulnerabilities
            @sbomApp={{this.sbomApp}}
            @sbomScan={{this.sbomScan}}
            @sbomScanComponent={{this.sbomScanComponent}}
          />
      `);

      await waitUntil(() => find('[data-test-sbom-loadingSvg]'), {
        timeout: 500,
      });

      assert.dom('[data-test-sbomScanComponentVulnerabilities]').exists();

      assert.dom('[data-test-sbom-loadingSvg]').exists();

      assert.dom('[data-test-sbom-loadingText]').hasText('t:loading:()...');

      await waitFor(
        '[data-test-sbomScanComponentVulnerabilities-emptyTextTitle]',
        {
          timeout: 500,
        }
      );

      assert
        .dom('[data-test-sbomScanComponentVulnerabilities-emptyTextTitle]')
        .hasText('t:sbomModule.knownVulnerabilitiesEmptyText.title:()');

      assert
        .dom(
          '[data-test-sbomScanComponentVulnerabilities-emptyTextDescription]'
        )
        .hasText('t:sbomModule.knownVulnerabilitiesEmptyText.description:()');

      assert
        .dom('[data-test-sbomScanComponentVulnerabilities-emptySvg]')
        .exists();
    });

    test('it renders the vulnerabilities of a component', async function (assert) {
      this.server.get(
        '/v2/sb_components/:comp_id/sb_vulnerability_audits',
        (schema) => {
          const results =
            schema.sbomScanComponentVulnerabilityAffects.all().models;

          return { count: results.length, next: null, previous: null, results };
        }
      );

      this.sbomScanComponentVulnerabilityAffects = this.server.createList(
        'sbom-scan-component-vulnerability-affect',
        3
      );

      await render(hbs`
        <Sbom::ScanDetails::ComponentDetails::Vulnerabilities
            @sbomApp={{this.sbomApp}}
            @sbomScan={{this.sbomScan}}
            @sbomScanComponent={{this.sbomScanComponent}}
          />
      `);

      assert.dom('[data-test-sbomScanComponentVulnerabilities-table]').exists();

      const vulnerabilityRows = findAll(
        '[data-test-sbomScanComponentVulnerabilities-row]'
      );

      assert.strictEqual(
        vulnerabilityRows.length,
        this.sbomScanComponentVulnerabilityAffects.length,
        'renders the correct number of vulnerabilities'
      );

      // content check for first row cells
      const rowCell = vulnerabilityRows[0].querySelectorAll(
        '[data-test-sbomScanComponentVulnerabilities-cell]'
      );

      const store = this.owner.lookup('service:store');

      const normalized = store.normalize(
        'sbom-scan-component-vulnerability-affect',
        this.sbomScanComponentVulnerabilityAffects[0].toJSON()
      );

      const sbomScanComponentVulnerabilityAffect = store.push(normalized);

      assert
        .dom(rowCell[0])
        .hasText(
          `${sbomScanComponentVulnerabilityAffect.sbVulnerability.vulnerabilityId}`
        );

      const isUnknown =
        sbomScanComponentVulnerabilityAffect.sbVulnerability.severity ===
        VulnerabilitySeverity.UNKNOWN;

      assert
        .dom(rowCell[1])
        .hasText(
          isUnknown
            ? '-'
            : `${sbomScanComponentVulnerabilityAffect.sbVulnerability.score}`
        );

      assert
        .dom(rowCell[2])
        .hasText(
          sbomScanComponentVulnerabilityAffect.sbVulnerability
            .severityDisplayValue
        );
    });
  }
);
