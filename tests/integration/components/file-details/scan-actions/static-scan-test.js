import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

const staticScanStatus = {
  completed: 'completed',
  inProgress: 'inProgress',
};

module(
  'Integration | Component | file-details/scan-actions/static-scan',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

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

    test.each(
      'test different states of static scan',
      [staticScanStatus.completed, staticScanStatus.inProgress],
      async function (assert, scanStatus) {
        if (scanStatus === staticScanStatus.completed) {
          this.file.isStaticDone = true;
        } else {
          this.file.isStaticDone = false;
          this.file.staticScanProgress = 80;
        }

        this.server.get('/manualscans/:id', (schema, req) => {
          return { id: req.params.id };
        });

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(`${req.params.id}`)?.toJSON();
        });

        await render(hbs`
        <FileDetails::ScanActions @file={{this.file}} />
      `);

        assert
          .dom('[data-test-fileDetailScanActions-scan-type-cards]')
          .exists();

        assert
          .dom('[data-test-fileDetailScanActions-staticScanTitle]')
          .hasText(t('sast'));

        if (scanStatus === staticScanStatus.completed) {
          assert
            .dom('[data-test-fileDetailScanActions-staticScanCompletedStatus]')
            .hasText(t('completed'));
        } else {
          assert
            .dom('[data-test-fileDetailScanActions-staticScanInProgressStatus]')
            .hasText(`${t('scanning')}... ${this.file.staticScanProgress}%`);
        }
      }
    );
  }
);
