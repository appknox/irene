import { click, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { Response } from 'miragejs';
import { module, test } from 'qunit';

module(
  'Integration | Component | sbom/component-insights/vulnerabilities',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.sbomComponent = this.owner
        .lookup('service:store')
        .createRecord('sbom-component', {
          id: '1',
          version: '1.0.0',
          latestVersion: '2.0.0',
        });

      this.selected = [];
      this.onSelect = (id) => this.selected.push(id);
    });

    const serveAudits = (server, count) => {
      server.createList('sbom-vulnerability-audit', count);

      server.get(
        '/v2/sb_file_component/:comp_id/sb_vulnerability_audits',
        (schema, request) => {
          const all = schema.sbomVulnerabilityAudits.all().models;
          const limit = Number(request.queryParams.limit);

          return {
            count: all.length,
            next: null,
            previous: null,
            results: all.slice(0, limit),
          };
        }
      );
    };

    test('it shows the first vulnerability and pages through all of them', async function (assert) {
      serveAudits(this.server, 3);

      await render(hbs`
        <Sbom::ComponentInsights::Vulnerabilities @sbomComponent={{this.sbomComponent}} @onSelect={{this.onSelect}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-pager-current]')
        .hasText('01');

      assert
        .dom('[data-test-sbomComponentInsights-pager-total]')
        .hasText(t('sbomModule.componentInsights.ofTotal', { total: '03' }));

      assert.dom('[data-test-sbomComponentVulnerabilities-detail]').exists();

      await click('[data-test-sbomComponentInsights-pager-next]');

      assert.strictEqual(this.selected.length, 1);
    });

    test('selectedId is matched case-insensitively and unknown falls back to first', async function (assert) {
      serveAudits(this.server, 3);

      const second = this.server.schema.sbomVulnerabilityAudits.all().models[1];
      const id = second.attrs.sb_vulnerability.vulnerability_id;

      this.selectedId = id.toLowerCase();

      await render(hbs`
        <Sbom::ComponentInsights::Vulnerabilities @sbomComponent={{this.sbomComponent}} @selectedId={{this.selectedId}} @onSelect={{this.onSelect}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-id]')
        .hasText(id);

      this.set('selectedId', 'NOPE-0000');

      assert
        .dom('[data-test-sbomComponentInsights-pager-current]')
        .hasText('01');
    });

    test('it renders the no-vulnerabilities state with the outdated note', async function (assert) {
      this.server.get(
        '/v2/sb_file_component/:comp_id/sb_vulnerability_audits',
        () => ({
          count: 0,
          next: null,
          previous: null,
          results: [],
        })
      );

      await render(hbs`
        <Sbom::ComponentInsights::Vulnerabilities @sbomComponent={{this.sbomComponent}} @onSelect={{this.onSelect}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-emptyTitle]')
        .hasText(t('sbomModule.componentInsights.noKnownVulnerabilities'));

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-outdated]')
        .hasText(
          t('sbomModule.componentInsights.outdated', {
            current: '1.0.0',
            latest: '2.0.0',
          })
        );

      assert.dom('[data-test-sbomComponentInsights-pager]').doesNotExist();
    });

    test('it shows an error state with retry', async function (assert) {
      this.owner.lookup('service:logger').debug = () => {};

      this.server.get(
        '/v2/sb_file_component/:comp_id/sb_vulnerability_audits',
        () => new Response(500, {}, { detail: 'boom' })
      );

      await render(hbs`
        <Sbom::ComponentInsights::Vulnerabilities @sbomComponent={{this.sbomComponent}} @onSelect={{this.onSelect}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-error]')
        .containsText(t('sbomModule.componentInsights.loadError'));

      serveAudits(this.server, 1);

      await click('[data-test-sbomComponentInsights-vulnerabilities-retry]');

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-error]')
        .doesNotExist();

      assert
        .dom('[data-test-sbomComponentInsights-pager-current]')
        .hasText('01');
    });

    test('the vulnerability id links to the advisory with a GitHub tooltip', async function (assert) {
      serveAudits(this.server, 1);

      const vulnerability =
        this.server.schema.sbomVulnerabilityAudits.all().models[0].attrs
          .sb_vulnerability;

      await render(hbs`
        <Sbom::ComponentInsights::Vulnerabilities @sbomComponent={{this.sbomComponent}} @onSelect={{this.onSelect}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-idLink]')
        .hasAttribute('href', vulnerability.source_url)
        .hasAttribute('target', '_blank')
        .hasAttribute('rel', 'noopener noreferrer');

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-idLink]')
        .hasAttribute(
          'aria-label',
          `${vulnerability.vulnerability_id} - ${t('sbomModule.componentInsights.openGithubAdvisory')}`
        );

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-id]')
        .hasText(vulnerability.vulnerability_id);

      await triggerEvent(
        '[data-test-sbomComponentInsights-vulnerabilities-idLink]',
        'mouseenter'
      );

      assert
        .dom('[data-test-ak-tooltip-content]')
        .hasText(t('sbomModule.componentInsights.openGithubAdvisory'));
    });

    test('the id is plain text without an http(s) advisory url', async function (assert) {
      serveAudits(this.server, 1);

      const audit = this.server.schema.sbomVulnerabilityAudits.all().models[0];

      audit.update({
        sb_vulnerability: {
          ...audit.attrs.sb_vulnerability,
          source_url: 'javascript:alert(1)',
        },
      });

      await render(hbs`
        <Sbom::ComponentInsights::Vulnerabilities @sbomComponent={{this.sbomComponent}} @onSelect={{this.onSelect}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-idLink]')
        .doesNotExist();

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-id]')
        .exists();
    });

    test('a non-GitHub advisory gets the generic tooltip', async function (assert) {
      serveAudits(this.server, 1);

      const audit = this.server.schema.sbomVulnerabilityAudits.all().models[0];

      audit.update({
        sb_vulnerability: {
          ...audit.attrs.sb_vulnerability,
          source_name: 'NVD',
          source_url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-0001',
        },
      });

      await render(hbs`
        <Sbom::ComponentInsights::Vulnerabilities @sbomComponent={{this.sbomComponent}} @onSelect={{this.onSelect}} />
      `);

      await triggerEvent(
        '[data-test-sbomComponentInsights-vulnerabilities-idLink]',
        'mouseenter'
      );

      assert
        .dom('[data-test-ak-tooltip-content]')
        .hasText(t('sbomModule.componentInsights.openAdvisory'));
    });

    test('the id is plain text for a relative or malformed advisory url', async function (assert) {
      serveAudits(this.server, 1);

      const audit = this.server.schema.sbomVulnerabilityAudits.all().models[0];

      audit.update({
        sb_vulnerability: {
          ...audit.attrs.sb_vulnerability,
          source_url: '/advisories/not-absolute',
        },
      });

      await render(hbs`
        <Sbom::ComponentInsights::Vulnerabilities @sbomComponent={{this.sbomComponent}} @onSelect={{this.onSelect}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-idLink]')
        .doesNotExist();

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-id]')
        .exists();
    });

    test('a GHSA id with a generic advisories url links to the exact GitHub advisory', async function (assert) {
      serveAudits(this.server, 1);

      const audit = this.server.schema.sbomVulnerabilityAudits.all().models[0];

      audit.update({
        sb_vulnerability: {
          ...audit.attrs.sb_vulnerability,
          vulnerability_id: 'GHSA-qv32-7r6p-xhhh',
          source_url: 'https://github.com/advisories',
        },
      });

      await render(hbs`
        <Sbom::ComponentInsights::Vulnerabilities @sbomComponent={{this.sbomComponent}} @onSelect={{this.onSelect}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-idLink]')
        .hasAttribute(
          'href',
          'https://github.com/advisories/GHSA-qv32-7r6p-xhhh'
        );
    });

    test('a CVE found in the advisory url is shown as the label', async function (assert) {
      serveAudits(this.server, 1);

      const audit = this.server.schema.sbomVulnerabilityAudits.all().models[0];

      audit.update({
        sb_vulnerability: {
          ...audit.attrs.sb_vulnerability,
          vulnerability_id: 'GHSA-qv32-7r6p-xhhh',
          source_url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-0001',
        },
      });

      await render(hbs`
        <Sbom::ComponentInsights::Vulnerabilities @sbomComponent={{this.sbomComponent}} @onSelect={{this.onSelect}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-id]')
        .hasText('CVE-2024-0001');

      assert
        .dom('[data-test-sbomComponentInsights-vulnerabilities-idLink]')
        .hasAttribute('href', 'https://nvd.nist.gov/vuln/detail/CVE-2024-0001');
    });
  }
);
