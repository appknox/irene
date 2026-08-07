import { render, findAll, click, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import dayjs from 'dayjs';
import ENUMS from 'irene/enums';

class NotificationsStub extends Service {
  errorMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success() {}
}

class WindowStub extends Service {
  url = null;
  target = null;

  open(url, target) {
    this.url = url;
    this.target = target;
  }
}

module(
  'Integration | Component | sbom/component-inventory/details-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:browser/window', WindowStub);

      this.store = this.owner.lookup('service:store');
      this.onClose = () => {};

      // Component under inspection: factory-driven, only the props the
      // assertions exercise are overridden. Loaded through the store so it is a
      // real record instead of hand-pushed attributes.
      this.componentModel = this.server.create('sbom-component-inventory', {
        version: '4.4.3',
        latest_version: '4.13.2',
        component_type: 'file',
        status: 'VULNERABLE',
      });

      this.server.get('/v2/sb_components/:id', (schema, req) =>
        schema.sbomComponentInventories.find(`${req.params.id}`)?.toJSON()
      );

      this.component = await this.store.findRecord(
        'sbom-component-inventory',
        this.componentModel.id
      );

      // Default drill-down: no apps. Tests that need apps override this.
      this.server.get('/v2/sb_components/:id/sb_projects', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });
    });

    test('it renders component details and its apps', async function (assert) {
      const app = this.server.create('sbom-project');

      this.server.get('/v2/sb_components/:id/sb_projects', () => {
        return {
          count: 1,
          next: null,
          previous: null,
          results: [app.toJSON()],
        };
      });

      await render(hbs`
        <Sbom::ComponentInventory::DetailsDrawer
          @component={{this.component}}
          @open={{true}}
          @onClose={{this.onClose}}
        />
      `);

      const {
        bom_ref: bomRef,
        version,
        latest_version: latestVersion,
      } = this.componentModel.attrs;

      const {
        name: appName,
        package_name: appNamespace,
        last_sca_analysis_on: analysedOn,
      } = app.attrs;

      assert
        .dom('[data-test-componentInventory-detailsTitle]')
        .hasText(t('sbomModule.componentInventory.detailsTitle'));

      assert.dom('[data-test-componentInventory-detailsName]').hasText(bomRef);
      assert.dom('[data-test-componentInventory-detailsType]').hasText('File');
      assert
        .dom('[data-test-componentInventory-detailsVersion]')
        .hasText(version);

      assert
        .dom('[data-test-componentInventory-detailsLatestVersion]')
        .hasText(latestVersion);

      assert.dom('[data-test-componentInventory-appsTable]').exists();
      assert.strictEqual(
        findAll('[data-test-componentInventory-appsRow]').length,
        1,
        'renders one app row'
      );

      // App name, namespace and date all come inline from the drill-down
      // response, so the row renders with no per-row project/file/sb_file fetch.
      assert.dom('[data-test-componentInventory-appName]').hasText(appName);
      assert
        .dom('[data-test-componentInventory-appNamespace]')
        .hasText(appNamespace);
      assert
        .dom('[data-test-sbomApp-lastAnalysedOn]')
        .hasText(dayjs(analysedOn).format('DD MMM YYYY'));
    });

    test('it hides the version rows for a versionless component', async function (assert) {
      const versionless = this.server.create('sbom-component-inventory', {
        version: '',
        latest_version: '',
        component_type: 'machine-learning-model',
        status: 'SECURE',
      });

      this.component = await this.store.findRecord(
        'sbom-component-inventory',
        versionless.id
      );

      await render(hbs`
        <Sbom::ComponentInventory::DetailsDrawer
          @component={{this.component}}
          @open={{true}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-componentInventory-detailsVersion]')
        .doesNotExist();

      assert
        .dom('[data-test-componentInventory-detailsLatestVersion]')
        .doesNotExist();

      // Status is still shown for versionless components.
      assert.dom('[data-test-sbomComponent-status]').exists();
    });

    test('clicking an app row navigates to its component detail page', async function (assert) {
      const sbomFile = this.server.create('sbom-file');
      const app = this.server.create('sbom-project', {
        latest_sb_file: sbomFile.id,
      });

      const { bom_ref: bomRef, version } = this.componentModel.attrs;

      // The app's latest SBOM contains this exact component (bom-ref + version).
      const match = this.server.create('sbom-component', {
        bom_ref: bomRef,
        version,
      });

      this.server.get('/v2/sb_components/:id/sb_projects', () => {
        return {
          count: 1,
          next: null,
          previous: null,
          results: [app.toJSON()],
        };
      });

      this.server.get('/v2/sb_files/:id', (schema, req) =>
        schema.sbomFiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/v2/sb_files/:id/sb_file_components', () => {
        return {
          count: 1,
          next: null,
          previous: null,
          results: [match.toJSON()],
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
        `${match.id}`,
        'passes the matched sb_file_component id'
      );
      assert.strictEqual(transitions[0][4], 0, 'passes 0 as parent id');
    });

    test('an app row with no matching component shows an error and does not navigate', async function (assert) {
      const sbomFile = this.server.create('sbom-file');
      const app = this.server.create('sbom-project', {
        latest_sb_file: sbomFile.id,
      });

      // The app's latest SBOM has a different component (no bom-ref match).
      const other = this.server.create('sbom-component', {
        bom_ref: 'maven::other:other',
        version: '1.0.0',
      });

      this.server.get('/v2/sb_components/:id/sb_projects', () => {
        return {
          count: 1,
          next: null,
          previous: null,
          results: [app.toJSON()],
        };
      });

      this.server.get('/v2/sb_files/:id', (schema, req) =>
        schema.sbomFiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/v2/sb_files/:id/sb_file_components', () => {
        return {
          count: 1,
          next: null,
          previous: null,
          results: [other.toJSON()],
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

      assert.strictEqual(transitions.length, 0, 'does not navigate');

      const notify = this.owner.lookup('service:notifications');
      assert.strictEqual(
        notify.errorMsg,
        t('sbomModule.componentInventory.componentNotFoundInApp'),
        'shows a not-found error'
      );
    });

    test('the download button creates an export and opens its url', async function (assert) {
      const downloadUrl =
        'https://storage.example.test/sbom_component_inventory_1_1.xlsx?sig=abc';

      // Create returns a completed job straight away, so no waiting is needed.
      this.server.post('/v2/sb_components/:id/export', () => {
        return {
          id: 1,
          status: ENUMS.SBOM_COMPONENT_EXPORT_STATUS.COMPLETED,
          download_url: downloadUrl,
        };
      });

      await render(hbs`
        <Sbom::ComponentInventory::DetailsDrawer
          @component={{this.component}}
          @open={{true}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-componentInventory-downloadBtn]')
        .exists()
        .hasText(t('sbomModule.componentInventory.downloadXlsx'));

      await click('[data-test-componentInventory-downloadBtn]');

      const windowStub = this.owner.lookup('service:browser/window');
      assert.strictEqual(windowStub.url, downloadUrl, 'opens the url');
      assert.strictEqual(windowStub.target, '_blank');
    });

    test('a websocket update completes a pending export and opens it', async function (assert) {
      const downloadUrl =
        'https://storage.example.test/sbom_component_inventory_1_7.xlsx?sig=ws';

      this.server.post('/v2/sb_components/:id/export', () => {
        return {
          id: 7,
          status: ENUMS.SBOM_COMPONENT_EXPORT_STATUS.PENDING,
          download_url: null,
        };
      });

      await render(hbs`
        <Sbom::ComponentInventory::DetailsDrawer
          @component={{this.component}}
          @open={{true}}
          @onClose={{this.onClose}}
        />
      `);

      const windowStub = this.owner.lookup('service:browser/window');

      // Kick off the download without awaiting; the task parks waiting for the
      // websocket push to flip the record's status.
      click('[data-test-componentInventory-downloadBtn]');

      // Once the create POST has resolved and the record is in the store,
      // simulate the backend's "model_updated" websocket push.
      await waitUntil(() => this.store.peekRecord('sbom-component-export', 7));

      this.store.push({
        data: {
          id: '7',
          type: 'sbom-component-export',
          attributes: {
            status: ENUMS.SBOM_COMPONENT_EXPORT_STATUS.COMPLETED,
            downloadUrl,
          },
        },
      });

      // The push resolves the waiter and the task opens the download.
      await waitUntil(() => windowStub.url !== null);

      assert.strictEqual(windowStub.url, downloadUrl, 'opens the url');
      assert.strictEqual(windowStub.target, '_blank');
    });

    test('the download shows an error when the export fails', async function (assert) {
      this.server.post('/v2/sb_components/:id/export', () => {
        return {
          id: 2,
          status: ENUMS.SBOM_COMPONENT_EXPORT_STATUS.FAILED,
          download_url: null,
        };
      });

      await render(hbs`
        <Sbom::ComponentInventory::DetailsDrawer
          @component={{this.component}}
          @open={{true}}
          @onClose={{this.onClose}}
        />
      `);

      await click('[data-test-componentInventory-downloadBtn]');

      const windowStub = this.owner.lookup('service:browser/window');
      assert.strictEqual(windowStub.url, null, 'does not open a url');

      const notify = this.owner.lookup('service:notifications');
      assert.strictEqual(
        notify.errorMsg,
        t('sbomModule.componentInventory.exportFailed'),
        'shows an export-failed error'
      );
    });
  }
);
