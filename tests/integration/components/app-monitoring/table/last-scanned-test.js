import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | app-monitoring/table/last-scanned',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    test('it renders the correct row version', async function (assert) {
      // Server mocks
      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return schema.amApps.find(`${req.params.id}`)?.toJSON();
      });

      // AmAppRecord
      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', 1);

      const project = this.server.create('project', {
        id: 1,
        last_file_id: file.id,
      });

      const amApp = this.server.create('am-app', {
        id: 1,
        project: project.id,
      });

      const normalized = store.normalize('am-app', amApp.toJSON());

      this.amApp = store.push(normalized);

      await render(
        hbs`<AppMonitoring::Table::LastScanned @amApp={{this.amApp}} />`
      );

      assert
        .dom(`[data-test-am-table-row-version]`)
        .hasText(
          `${this.amApp.project.get('lastFile').get('comparableVersion')}`
        );
    });
  }
);
