import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import faker from 'faker';

module(
  'Integration | Component | app-monitoring/version-table/scan-status',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);
    setupMirage(hooks);

    test.each(
      'it renders',
      [
        [true, false],
        [true, true],
        [false, false],
      ],
      async function (assert, [isScanned, transitionedFromUnscannedToScanned]) {
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
        const futureDate = faker.date.future().toISOString();
        const pastDate = faker.date.past().toISOString();

        // File Record
        const file = this.server.create('file', {
          id: 1,
          created_on: transitionedFromUnscannedToScanned
            ? futureDate
            : pastDate,
        });

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
        const versionHasLatestFile = isScanned;

        const amAppVersion = this.server.create('am-app-version', {
          id: 1,
          latest_file: versionHasLatestFile ? file.id : null,
          am_app: amApp.id,
          created_on: transitionedFromUnscannedToScanned
            ? pastDate
            : futureDate,
        });

        const normalizedAmAppVersion = store.normalize(
          'am-app-version',
          amAppVersion.toJSON()
        );

        this.amAppVersion = store.push(normalizedAmAppVersion);

        await render(
          hbs`<AppMonitoring::VersionTable::ScanStatus @amAppVersion={{this.amAppVersion}} />`
        );

        assert.dom('[data-test-amVersionTable-scanStatusRoot]').exists();

        // Selectors
        const notScannedStatusSelector =
          '[data-test-amVersionTable-storeVersionStatus-notScanned]';

        const scannedStatusSelector =
          '[data-test-amVersionTable-storeVersionStatus-scanned]';

        const transitionArrowSelector =
          '[data-test-amVersionTable-storeVersion-transitionArrow]';

        const fileIDSelector = '[data-test-amVersionTable-storeVersion-fileID]';

        // Not Scanned and not transitioned
        if (!isScanned && !transitionedFromUnscannedToScanned) {
          assert
            .dom(notScannedStatusSelector)
            .exists()
            .containsText('t:notScanned:()');

          assert.dom(transitionArrowSelector).doesNotExist();
          assert.dom(scannedStatusSelector).doesNotExist();
        }

        // Scanned and transitioned
        if (isScanned && transitionedFromUnscannedToScanned) {
          assert
            .dom(notScannedStatusSelector)
            .exists()
            .containsText('t:notScanned:()');

          assert.dom(transitionArrowSelector).exists();

          assert
            .dom(fileIDSelector)
            .exists()
            .containsText('t:fileID:()')
            .containsText(this.amAppVersion.get('latestFile').get('id'));
        }

        // Scanned and not transitioned
        if (isScanned && !transitionedFromUnscannedToScanned) {
          assert.dom(notScannedStatusSelector).doesNotExist();
          assert.dom(transitionArrowSelector).doesNotExist();

          assert
            .dom(fileIDSelector)
            .exists()
            .containsText('t:fileID:()')
            .containsText(this.amAppVersion.get('latestFile').get('id'));

          assert
            .dom(scannedStatusSelector)
            .exists()
            .containsText('t:scanned:()');
        }
      }
    );
  }
);
