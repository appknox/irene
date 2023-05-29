import { findAll, waitFor, find, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { VulnerabilitySeverity } from 'irene/models/sbom-vulnerability';

module(
  'Integration | Component | sbom/scan-details/component-details/vulnerabilities',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.sbomProject = this.server.create('sbom-project');

      this.sbomFile = this.server.create('sbom-file');

      this.sbomComponent = this.server.create('sbom-component', {
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
            @sbomProject={{this.sbomProject}}
            @sbomFile={{this.sbomFile}}
            @sbomComponent={{this.sbomComponent}}
          />
      `);

      await waitUntil(() => find('[data-test-sbom-loadingSvg]'), {
        timeout: 500,
      });

      assert.dom('[data-test-sbomComponentVulnerabilities]').exists();

      assert.dom('[data-test-sbom-loadingSvg]').exists();

      assert.dom('[data-test-sbom-loadingText]').hasText('t:loading:()...');

      await waitFor('[data-test-sbomComponentVulnerabilities-emptyTextTitle]', {
        timeout: 500,
      });

      assert
        .dom('[data-test-sbomComponentVulnerabilities-emptyTextTitle]')
        .hasText('t:sbomModule.knownVulnerabilitiesEmptyText.title:()');

      assert
        .dom('[data-test-sbomComponentVulnerabilities-emptyTextDescription]')
        .hasText('t:sbomModule.knownVulnerabilitiesEmptyText.description:()');

      assert.dom('[data-test-sbomComponentVulnerabilities-emptySvg]').exists();
    });

    test('it renders the vulnerabilities of a component', async function (assert) {
      this.server.get(
        '/v2/sb_components/:comp_id/sb_vulnerability_audits',
        (schema) => {
          const results = schema.sbomVulnerabilityAudits.all().models;

          return { count: results.length, next: null, previous: null, results };
        }
      );

      this.sbomVulnerabilityAudits = this.server.createList(
        'sbom-vulnerability-audit',
        3
      );

      await render(hbs`
        <Sbom::ScanDetails::ComponentDetails::Vulnerabilities
            @sbomProject={{this.sbomProject}}
            @sbomFile={{this.sbomFile}}
            @sbomComponent={{this.sbomComponent}}
          />
      `);

      assert.dom('[data-test-sbomComponentVulnerabilities-table]').exists();

      const vulnerabilityRows = findAll(
        '[data-test-sbomComponentVulnerabilities-row]'
      );

      assert.strictEqual(
        vulnerabilityRows.length,
        this.sbomVulnerabilityAudits.length,
        'renders the correct number of vulnerabilities'
      );

      // content check for first row cells
      const rowCell = vulnerabilityRows[0].querySelectorAll(
        '[data-test-sbomComponentVulnerabilities-cell]'
      );

      const store = this.owner.lookup('service:store');

      const normalized = store.normalize(
        'sbom-vulnerability-audit',
        this.sbomVulnerabilityAudits[0].toJSON()
      );

      const sbomVulnerabilityAudit = store.push(normalized);

      assert
        .dom(rowCell[0])
        .hasText(`${sbomVulnerabilityAudit.sbVulnerability.vulnerabilityId}`);

      const isUnknown =
        sbomVulnerabilityAudit.sbVulnerability.severity ===
        VulnerabilitySeverity.UNKNOWN;

      assert
        .dom(rowCell[1])
        .hasText(
          isUnknown ? '-' : `${sbomVulnerabilityAudit.sbVulnerability.score}`
        );

      assert
        .dom(rowCell[2])
        .hasText(sbomVulnerabilityAudit.sbVulnerability.severityDisplayValue);
    });
  }
);
