import { render, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success() {}
}

module(
  'Integration | Component | sbom/component-inventory/details-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');

      this.component = store.push({
        data: {
          id: '1',
          type: 'sbom-component-inventory',
          attributes: {
            name: 'junit',
            namespace: 'junit',
            purlType: 'maven',
            bomRef: 'maven::junit:junit',
            version: '4.4.3',
            componentType: 'file',
            status: 'VULNERABLE',
          },
        },
      });

      this.onClose = () => {};
    });

    test('it renders component details and its apps', async function (assert) {
      const file = this.server.create('file');
      const project = this.server.create('project', { last_file: file });
      const sbomFile = this.server.create('sbom-file');
      const sbomProject = this.server.create('sbom-project', {
        project: project.id,
        latest_sb_file: sbomFile.id,
      });

      this.server.get('/v2/sb_components/:id/sb_projects', () => {
        return {
          count: 1,
          next: null,
          previous: null,
          results: [sbomProject.toJSON()],
        };
      });

      this.server.get('/v3/projects/:id', (schema, req) =>
        schema.projects.find(`${req.params.id}`)?.toJSON()
      );
      this.server.get('/v3/files/:id', (schema, req) =>
        schema.files.find(`${req.params.id}`)?.toJSON()
      );
      this.server.get('/v2/sb_files/:id', (schema, req) =>
        schema.sbomFiles.find(`${req.params.id}`)?.toJSON()
      );

      await render(hbs`
        <Sbom::ComponentInventory::DetailsDrawer
          @component={{this.component}}
          @open={{true}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-componentInventory-detailsTitle]')
        .hasText(t('sbomModule.componentInventory.detailsTitle'));

      assert
        .dom('[data-test-componentInventory-detailsName]')
        .hasText('maven::junit:junit');

      assert.dom('[data-test-componentInventory-detailsType]').hasText('File');
      assert
        .dom('[data-test-componentInventory-detailsVersion]')
        .hasText('4.4.3');

      assert.dom('[data-test-componentInventory-appsTable]').exists();

      const appRows = findAll('[data-test-componentInventory-appsRow]');
      assert.strictEqual(appRows.length, 1, 'renders one app row');

      assert.dom('[data-test-componentInventory-appName]').exists();
      assert.dom('[data-test-componentInventory-appNamespace]').exists();
      assert.dom('[data-test-sbomApp-lastAnalysedOn]').exists();
    });

    test('clicking an app row navigates to its component detail page', async function (assert) {
      const file = this.server.create('file');
      const project = this.server.create('project', { last_file: file });
      const sbomFile = this.server.create('sbom-file');
      const sbomProject = this.server.create('sbom-project', {
        project: project.id,
        latest_sb_file: sbomFile.id,
      });

      this.server.get('/v2/sb_components/:id/sb_projects', () => {
        return {
          count: 1,
          next: null,
          previous: null,
          results: [sbomProject.toJSON()],
        };
      });

      this.server.get('/v3/projects/:id', (schema, req) =>
        schema.projects.find(`${req.params.id}`)?.toJSON()
      );
      this.server.get('/v3/files/:id', (schema, req) =>
        schema.files.find(`${req.params.id}`)?.toJSON()
      );
      this.server.get('/v2/sb_files/:id', (schema, req) =>
        schema.sbomFiles.find(`${req.params.id}`)?.toJSON()
      );

      // On row click the drawer resolves the app-specific SBFileComponent id
      // by querying the app's latest SBOM components.
      this.server.get('/v2/sb_files/:id/sb_file_components', () => {
        return {
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 210,
              name: 'junit',
              bom_ref: 'maven::junit:junit',
              version: '4.4.3',
              type: 'file',
            },
          ],
        };
      });

      const transitions = [];
      const router = this.owner.lookup('service:router');
      router.transitionTo = (...args) => transitions.push(args);

      await render(hbs`
        <Sbom::ComponentInventory::DetailsDrawer
          @component={{this.component}}
          @open={{true}}
          @onClose={{this.onClose}}
        />
      `);

      await click('[data-test-componentInventory-appsRow]');

      assert.strictEqual(transitions.length, 1, 'navigates once');
      assert.strictEqual(
        transitions[0][0],
        'authenticated.dashboard.sbom.component-details.overview'
      );
      assert.strictEqual(
        `${transitions[0][3]}`,
        '210',
        'passes the matched sb_file_component id'
      );
      assert.strictEqual(transitions[0][4], 0, 'passes 0 as parent id');
    });
  }
);
