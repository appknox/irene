import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';

module(
  'Integration | Component | file-details/scan-actions/dynamic-scan',
  function (hooks) {
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

    test('it renders dynamic scan title & btn', async function (assert) {
      this.server.get('/manualscans/:id', (schema, req) => {
        return { id: req.params.id };
      });

      this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
      this.file.isDynamicDone = false;

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      await render(hbs`
        <FileDetails::ScanActions @file={{this.file}} />
    `);

      assert.dom('[data-test-fileDetailScanActions-scan-type-cards]').exists();

      assert
        .dom('[data-test-fileDetailScanActions-dynamicScanTitle]')
        .hasText(t('dast'));

      assert
        .dom('[data-test-fileDetailScanActions-dynamicScanStatus]')
        .hasText(t('notStarted'));
    });

    test.each(
      'it renders different states of dynamic scan',
      [
        { dynamicStatus: ENUMS.DYNAMIC_STATUS.INQUEUE, done: false },
        { dynamicStatus: ENUMS.DYNAMIC_STATUS.DOWNLOADING, done: false },
        { dynamicStatus: ENUMS.DYNAMIC_STATUS.NONE, done: true },
      ],
      async function (assert, scan) {
        this.file.dynamicStatus = scan.dynamicStatus;
        this.file.isDynamicDone = scan.done;

        this.server.get('/manualscans/:id', (schema, req) => {
          return { id: req.params.id };
        });

        await render(hbs`
            <FileDetails::ScanActions::DynamicScan @file={{this.file}} />
        `);

        if (this.file.isDynamicDone) {
          assert
            .dom('[data-test-fileDetailScanActions-dynamicScanStatus]')
            .exists()
            .hasText(t('completed'));
        } else if (this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.INQUEUE) {
          assert
            .dom('[data-test-fileDetailScanActions-dynamicScanStatus]')
            .exists()
            .hasText(t('deviceInQueue'));
        } else if (
          this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.DOWNLOADING
        ) {
          assert
            .dom('[data-test-fileDetailScanActions-dynamicScanStatus]')
            .exists()
            .hasText(t('deviceDownloading'));
        }
      }
    );
  }
);
