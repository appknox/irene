import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | file-details/scan-actions', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const store = this.owner.lookup('service:store');

    const file = this.server.create('file', {
      project: '1',
    });

    this.server.create('project', { file: file.id, id: '1' });

    this.setProperties({
      file: store.push(store.normalize('file', file.toJSON())),
    });

    await this.owner.lookup('service:organization').load();
  });

  test('it renders scan actions', async function (assert) {
    this.server.get('/manualscans/:id', (schema, req) => {
      return { id: req.params.id };
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
        <FileDetails::ScanActions @file={{this.file}} />
    `);

    assert.dom('[data-test-fileDetailScanActions-scan-type-cards]').exists();
  });
});
