import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module(
  'Integration | Component | app-monitoring/version-table/store-version',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    test('it renders', async function (assert) {
      // Server mocks
      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_app_versions/:id', (schema, req) => {
        return schema.amAppVersions.find(`${req.params.id}`)?.toJSON();
      });

      // Models
      const store = this.owner.lookup('service:store');

      // File Record
      const file = this.server.create('file', 1);

      // Project Record
      const project = this.server.create('project', {
        last_file_id: file.id,
      });

      // AmApp Record.
      const amApp = this.server.create('am-app', {
        id: 1,
        latest_file: file.id,
        project: project.id,
      });

      // AmAppVersion
      const amAppVersion = this.server.create('am-app-version', {
        id: 1,
        latest_file: file.id,
        am_app: amApp.id,
      });

      const normalizedAmAppVersion = store.normalize(
        'am-app-version',
        amAppVersion.toJSON()
      );

      this.amAppVersion = store.push(normalizedAmAppVersion);

      await render(
        hbs`<AppMonitoring::VersionTable::StoreVersion @amAppVersion={{this.amAppVersion}} />`
      );

      assert
        .dom('[data-test-amVersionTable-storeVersion]')
        .exists()
        .containsText(this.amAppVersion.get('displayVersion'));
    });
  }
);
