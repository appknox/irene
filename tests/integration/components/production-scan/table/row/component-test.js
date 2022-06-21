import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | production-scan/table/row', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('It renders with the right row data', async function (assert) {
    this.set('project', {
      id: 31209,
      project: 7601,
      name: 'RootBeer Sample',
      package_name: 'com.unilever.productocr',
      version: '5.3.2',
      version_code: '1192',
      production_version: 'Unknown',
      production_version_code: '1226',
      file_id: 12345,
      app_url:
        'https://play.google.com/store/apps/details?id=org.wordpress.android',
      platform: 'android',
      status: 'completed',
    });

    await render(hbs`<ProductionScan::Table::Row @project={{this.project}} />`);

    assert.strictEqual(
      this.element.querySelectorAll('[data-test-table-row-item]').length,
      5,
      'It has five row items'
    );

    assert
      .dom(`[data-test-table-row-app-namespace]`)
      .containsText(this.project.name)
      .containsText(this.project.package_name);

    assert
      .dom(`[data-test-table-row-prod-version]`)
      .hasText(this.project.production_version);

    assert
      .dom(`[data-test-table-row-platform=${this.project.platform}]`)
      .exists();

    assert.dom(`[data-test-table-row-version]`).hasText(this.project.version);

    assert.dom(`[data-test-table-row-status]`).hasText(this.project.status);
  });
});
