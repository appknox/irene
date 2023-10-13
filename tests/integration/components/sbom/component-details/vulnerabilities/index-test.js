import {
  findAll,
  waitFor,
  find,
  render,
  waitUntil,
  click,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { VulnerabilitySeverity } from 'irene/models/sbom-vulnerability';

module(
  'Integration | Component | sbom/component-details/vulnerabilities',
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

      this.sbomVulnerabilityAudits = this.server.createList(
        'sbom-vulnerability-audit',
        3
      );
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
        <Sbom::ComponentDetails::Vulnerabilities @sbomComponent={{this.sbomComponent}} />
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

      await render(hbs`
        <Sbom::ComponentDetails::Vulnerabilities @sbomComponent={{this.sbomComponent}} />
      `);

      const vulnerabilityColHeaders = findAll(
        '[data-test-sbomComponentVulnerabilities-listHead]'
      );

      assert.strictEqual(vulnerabilityColHeaders.length, 3);

      assert
        .dom(vulnerabilityColHeaders[0])
        .hasText('t:sbomModule.vulnerabilityId:()');

      assert
        .dom(vulnerabilityColHeaders[1])
        .hasText('t:sbomModule.severity:()');

      assert
        .dom(vulnerabilityColHeaders[2])
        .hasText('t:sbomModule.cvssV3Score:()');

      const vulnerabilityRows = findAll(
        '[data-test-sbomComponentVulnerabilities-listItem]'
      );

      assert.strictEqual(
        vulnerabilityRows.length,
        this.sbomVulnerabilityAudits.length,
        'renders the correct number of vulnerabilities'
      );

      // content check for first row cells
      const rowCell = vulnerabilityRows[0].querySelectorAll(
        '[data-test-sbomComponentVulnerabilities-listCell]'
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

      assert
        .dom(rowCell[1])
        .hasText(sbomVulnerabilityAudit.sbVulnerability.severityDisplayValue);

      const isUnknown =
        sbomVulnerabilityAudit.sbVulnerability.severity ===
        VulnerabilitySeverity.UNKNOWN;

      assert
        .dom(rowCell[2])
        .hasText(
          isUnknown ? '-' : `${sbomVulnerabilityAudit.sbVulnerability.score}`
        );
    });

    test('it toggles & render the vulnerability details', async function (assert) {
      this.server.get(
        '/v2/sb_components/:comp_id/sb_vulnerability_audits',
        (schema) => {
          const results = schema.sbomVulnerabilityAudits.all().models;

          return { count: results.length, next: null, previous: null, results };
        }
      );

      await render(hbs`
        <Sbom::ComponentDetails::Vulnerabilities @sbomComponent={{this.sbomComponent}} />
      `);

      const vulnerabilityRows = findAll(
        '[data-test-sbomComponentVulnerabilities-listItem]'
      );

      assert.strictEqual(
        vulnerabilityRows.length,
        this.sbomVulnerabilityAudits.length,
        'renders the correct number of vulnerabilities'
      );

      // content check for first row cells
      const rowCell = vulnerabilityRows[0].querySelectorAll(
        '[data-test-sbomComponentVulnerabilities-listCell]'
      );

      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-toggleDetailsBtn]',
          rowCell[0]
        )
        .isNotDisabled();

      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-detail]',
          vulnerabilityRows[0]
        )
        .doesNotExist();

      // show vulnerability detail
      await click(
        rowCell[0].querySelector(
          '[data-test-sbomComponentVulnerabilities-toggleDetailsBtn]'
        )
      );

      const store = this.owner.lookup('service:store');

      const normalized = store.normalize(
        'sbom-vulnerability-audit',
        this.sbomVulnerabilityAudits[0].toJSON()
      );

      const sbomVulnerabilityAudit = store.push(normalized);

      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-detail]',
          vulnerabilityRows[0]
        )
        .exists();

      // description
      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-detailDescTitle]',
          vulnerabilityRows[0]
        )
        .hasText('t:description:()');

      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-detailDescValue]',
          vulnerabilityRows[0]
        )
        .hasText(sbomVulnerabilityAudit.sbVulnerability.description);

      // affected & fixed version
      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-affectedFixedVersionTitle]',
          vulnerabilityRows[0]
        )
        .hasText('t:sbomModule.affectedAndFixedVersion.title:()');

      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-affectedFixedVersion-table]'
        )
        .exists();

      const headers = findAll(
        '[data-test-sbomComponentVulnerabilities-affectedFixedVersion-thead] th'
      );

      assert.strictEqual(headers.length, 2);
      assert.dom(headers[0]).hasText('t:sbomModule.affectedVersions:()');
      assert.dom(headers[1]).hasText('t:sbomModule.fixedVersions:()');

      const rows = findAll(
        '[data-test-sbomComponentVulnerabilities-affectedFixedVersion-row]'
      );

      assert.strictEqual(rows.length, sbomVulnerabilityAudit.versions.length);

      const contents = rows[0].querySelectorAll(
        '[data-test-sbomComponentVulnerabilities-affectedFixedVersion-cell]'
      );

      const { parsedVersions, humanizedVersionRange } = sbomVulnerabilityAudit;

      const { affectedRange, fixedRange } = humanizedVersionRange(
        parsedVersions[0].version_range
      );

      assert.dom(contents[0]).hasText(affectedRange);
      assert.dom(contents[1]).hasText(fixedRange);

      // source
      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-detailSourceTitle]',
          vulnerabilityRows[0]
        )
        .hasText('t:source:()');

      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-detailSourceText]',
          vulnerabilityRows[0]
        )
        .hasText(
          `${sbomVulnerabilityAudit.sbVulnerability.sourceName} - ${sbomVulnerabilityAudit.sbVulnerability.sourceUrl}`
        );

      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-detailSourceLink]',
          vulnerabilityRows[0]
        )
        .hasTagName('a')
        .hasAttribute('href', sbomVulnerabilityAudit.sbVulnerability.sourceUrl)
        .hasAttribute('target', '_blank')
        .hasText(sbomVulnerabilityAudit.sbVulnerability.sourceUrl);

      // collapse vulnerability detail
      await click(
        rowCell[0].querySelector(
          '[data-test-sbomComponentVulnerabilities-toggleDetailsBtn]'
        )
      );

      assert
        .dom(
          '[data-test-sbomComponentVulnerabilities-detail]',
          vulnerabilityRows[0]
        )
        .doesNotExist();
    });

    test.each(
      'test vulnerability details with empty affected & fixed version',
      [
        [],
        [
          {
            version: '',
            version_range: '',
          },
        ],
        [
          {
            version: '',
            version_range:
              '{"version":"0","less_than":null,"less_than_or_equal":null}',
          },
        ],
      ],
      async function (assert, versions) {
        this.server.get(
          '/v2/sb_components/:comp_id/sb_vulnerability_audits',
          (schema) => {
            const results = schema.sbomVulnerabilityAudits.all().models;

            results[0].versions = versions;

            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          }
        );

        await render(hbs`
          <Sbom::ComponentDetails::Vulnerabilities @sbomComponent={{this.sbomComponent}} />
        `);

        const vulnerabilityRows = findAll(
          '[data-test-sbomComponentVulnerabilities-listItem]'
        );

        // content check for first row cells
        const rowCell = vulnerabilityRows[0].querySelectorAll(
          '[data-test-sbomComponentVulnerabilities-listCell]'
        );

        // show vulnerability detail
        await click(
          rowCell[0].querySelector(
            '[data-test-sbomComponentVulnerabilities-toggleDetailsBtn]'
          )
        );

        assert
          .dom(
            '[data-test-sbomComponentVulnerabilities-affectedFixedVersion-table]'
          )
          .doesNotExist();

        assert
          .dom(
            '[data-test-sbomComponentVulnerabilities-affectedFixedVersion-emptySvg]'
          )
          .exists();

        assert
          .dom(
            '[data-test-sbomComponentVulnerabilities-affectedFixedVersion-emptyTitle]'
          )
          .hasText('t:sbomModule.affectedAndFixedVersion.emptyTitle:()');
      }
    );
  }
);
