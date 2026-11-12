import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | sbom/component-insights', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  test('it shows the coordinate and replaces the vuln query param on paging', async function (assert) {
    this.sbomComponent = this.owner
      .lookup('service:store')
      .createRecord('sbom-component', {
        id: '1',
        bomRef: 'maven::com.fasterxml.jackson.core:jackson-databind:2.9.1',
        version: '2.9.1',
        latestVersion: '2.17.0',
        name: 'jackson-databind',
      });

    this.server.createList('sbom-vulnerability-audit', 2);

    this.server.get(
      '/v2/sb_file_component/:comp_id/sb_vulnerability_audits',
      (schema) => {
        const all = schema.sbomVulnerabilityAudits.all().models;

        return { count: all.length, next: null, previous: null, results: all };
      }
    );

    const calls = [];

    this.owner.lookup('service:router').replaceWith = (...args) => {
      calls.push(args.at(-1));
    };

    await render(
      hbs`<Sbom::ComponentInsights @sbomComponent={{this.sbomComponent}} />`
    );

    assert
      .dom('[data-test-sbomComponentInsights-coordinate]')
      .hasText('maven::com.fasterxml.jackson.core : jackson-databind');

    await click('[data-test-sbomComponentInsights-pager-next]');

    assert.strictEqual(calls.length, 1);
    assert.ok(calls[0].queryParams.vuln);

    // Advisory meta lives on the component-details tab, not on the insights page.
    assert.dom('[data-test-sbomComponentVulnerabilities-detail]').exists();
    assert
      .dom('[data-test-sbomComponentVulnerabilities-affectedFixedVersionTitle]')
      .doesNotExist();
    assert
      .dom('[data-test-sbomComponentVulnerabilities-detailSourceTitle]')
      .doesNotExist();
  });

  test('it omits the dangling separator when the group is empty', async function (assert) {
    this.sbomComponent = this.owner
      .lookup('service:store')
      .createRecord('sbom-component', {
        id: '2',
        bomRef: 'cocoapods::CocoaMQTT',
        name: 'CocoaMQTT',
        version: '1.0.0',
        latestVersion: '1.0.0',
      });

    this.server.get(
      '/v2/sb_file_component/:comp_id/sb_vulnerability_audits',
      () => ({ count: 0, next: null, previous: null, results: [] })
    );

    await render(
      hbs`<Sbom::ComponentInsights @sbomComponent={{this.sbomComponent}} />`
    );

    assert
      .dom('[data-test-sbomComponentInsights-coordinate]')
      .hasText('cocoapods : CocoaMQTT');
  });
});
