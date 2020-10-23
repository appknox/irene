import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | file/report-btn', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {});

  test('it should render btn in file details', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('file', {});
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);
    assert.dom(`[data-test-report="file-details"]`).exists();
    assert.dom(`[data-test-report="analysis"]`).doesNotExist();
  });
});
