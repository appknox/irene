import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | file/report-btn', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    const file = this.server.create('file');
    const fileNormalized = store.normalize('file', file.toJSON());

    this.setProperties({
      file: store.push(fileNormalized),
    });

    this.server.get('/v2/files/:id', (schema, req) =>
      schema.files.find(req.params.id)?.toJSON()
    );

    this.server.get('/v2/files/:id/sb_file', () => {
      return {
        id: null,
        file: 1,
      };
    });
  });

  test('it renders', async function (assert) {
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

    assert.dom(`[data-test-fileReportBtn]`).exists().hasText(t('viewReport'));
    assert.dom(`[data-test-fileReportBtn-icon]`).exists();
    assert.dom(`[data-test-fileReportDrawer]`).doesNotExist();
  });

  test('it is disabled if static scan is not done', async function (assert) {
    this.file.isStaticDone = false;

    await render(hbs`<File::ReportBtn @file={{this.file}} />`);

    assert.dom(`[data-test-fileReportBtn]`).exists().hasAttribute('disabled');
  });

  test('it is launches report drawer on click', async function (assert) {
    this.file.isStaticDone = true;

    await render(hbs`<File::ReportBtn @file={{this.file}} />`);

    assert.dom(`[data-test-fileReportBtn]`).exists();
    assert.dom(`[data-test-fileReportDrawer]`).doesNotExist();

    await click('[data-test-fileReportBtn]');

    assert.dom(`[data-test-fileReportDrawer]`).exists();
  });
});
