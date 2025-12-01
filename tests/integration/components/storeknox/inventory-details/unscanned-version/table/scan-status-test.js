import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { faker } from '@faker-js/faker';

module(
  'Integration | Component | storeknox/inventory-details/unscanned-version/table/scan-status',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    test.each(
      'it renders',
      [
        [true, false],
        [true, true],
        [false, false],
      ],
      async function (assert, [isScanned, transitionedFromUnscannedToScanned]) {
        // Services
        const store = this.owner.lookup('service:store');

        const futureDate = faker.date.future().toISOString();
        const pastDate = faker.date.past().toISOString();

        // Models
        const file = this.server.create('file');

        const skAppVersion = this.server.create('sk-app-version', {
          file: isScanned ? file.id : null,

          file_created_on: transitionedFromUnscannedToScanned
            ? futureDate
            : pastDate,

          created_on: transitionedFromUnscannedToScanned
            ? pastDate
            : futureDate,
        });

        this.skAppVersionRecord = store.push(
          store.normalize('sk-app-version', skAppVersion.toJSON())
        );

        // Server mocks
        this.server.get('/v3/files/:id', (schema, req) => {
          return schema.files.find(`${req.params.id}`)?.toJSON();
        });

        await render(
          hbs`<Storeknox::InventoryDetails::UnscannedVersion::Table::ScanStatus @skAppVersion={{this.skAppVersionRecord}} />`
        );

        assert
          .dom(
            '[data-test-storeknoxInventoryDetails-unscannedVersionTable-scanStatusRoot]'
          )
          .exists();

        // Selectors
        const notScannedStatusSelector =
          '[data-test-storeknoxInventoryDetails-unscannedVersionTable-storeVersionStatus-notScanned]';

        const scannedStatusSelector =
          '[data-test-storeknoxInventoryDetails-unscannedVersionTable-storeVersionStatus-scanned]';

        const transitionArrowSelector =
          '[data-test-storeknoxInventoryDetails-unscannedVersionTable-storeVersion-transitionArrow]';

        const fileIDSelector =
          '[data-test-storeknoxInventoryDetails-unscannedVersionTable-storeVersion-fileID]';

        // Not Scanned and not transitioned
        if (!isScanned && !transitionedFromUnscannedToScanned) {
          assert
            .dom(notScannedStatusSelector)
            .exists()
            .containsText(t('notScanned'));

          assert.dom(transitionArrowSelector).doesNotExist();
          assert.dom(scannedStatusSelector).doesNotExist();
        }

        // Scanned and transitioned
        if (isScanned && transitionedFromUnscannedToScanned) {
          assert
            .dom(notScannedStatusSelector)
            .exists()
            .containsText(t('notScanned'));

          assert.dom(transitionArrowSelector).exists();

          assert
            .dom(fileIDSelector)
            .containsText(t('fileID'))
            .containsText(this.skAppVersionRecord.get('file').get('id'));
        }

        // Scanned and not transitioned
        if (isScanned && !transitionedFromUnscannedToScanned) {
          assert.dom(notScannedStatusSelector).doesNotExist();
          assert.dom(transitionArrowSelector).doesNotExist();

          assert
            .dom(fileIDSelector)
            .containsText(t('fileID'))
            .containsText(this.skAppVersionRecord.get('file').get('id'));

          assert.dom(scannedStatusSelector).exists().containsText(t('scanned'));
        }
      }
    );
  }
);
