import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import { setupKnoxiqFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';
import { knoxiqScanStatuses } from 'irene/tests/helpers/knoxiq-test-utils';

module(
  'Integration | Component | file-details/knoxiq scan-actions',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      setupKnoxiqFileModelEndpoints(this.server);
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', {
        project: '1',
        is_static_done: true,
      });

      this.server.create('project', { last_file: file, id: '1' });

      this.file = store.push(store.normalize('file', file.toJSON()));
      this.file.isStaticDone = true;
      this.file.isDynamicDone = true;
      this.file.isKnoxiqAutomated = true;

      this.knoxiqStatuses = knoxiqScanStatuses({
        sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
        dast: ENUMS.KNOXIQ_SCAN_STATUS.RUNNING,
      });

      this.server.get('/manualscans/:id', () => ({ id: '1' }));
      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      await this.owner.lookup('service:organization').load();
    });

    test('it renders KnoxIQ status chips when knoxiq is enabled', async function (assert) {
      await render(hbs`
        <FileDetails::ScanActions
          @file={{this.file}}
          @isKnoxiqEnabled={{true}}
          @knoxiqStatuses={{this.knoxiqStatuses}}
        />
      `);

      assert.dom('[data-test-fileDetailScanActions-scan-type-cards]').exists();
      assert
        .dom('[data-test-fileDetailScanActions-staticScanTitle]')
        .hasText(t('staticScan'));
      assert.dom('[data-test-fileDetailScanActions-dynamicScanTitle]').exists();

      assert.dom().containsText(t('completed'));
    });

    test('it renders the running chip for in-progress KnoxIQ scans', async function (assert) {
      this.knoxiqStatuses = knoxiqScanStatuses({
        sast: ENUMS.KNOXIQ_SCAN_STATUS.RUNNING,
        dast: ENUMS.KNOXIQ_SCAN_STATUS.RUNNING,
      });

      await render(hbs`
        <FileDetails::ScanActions
          @file={{this.file}}
          @isKnoxiqEnabled={{true}}
          @knoxiqStatuses={{this.knoxiqStatuses}}
        />
      `);

      assert.dom().containsText(t('knoxIq.statusChip.running'));
      assert.dom().doesNotContainText(t('knoxIq.statusChip.failed'));
    });

    test('it renders the failed chip when a KnoxIQ scan errors', async function (assert) {
      this.knoxiqStatuses = knoxiqScanStatuses({
        sast: ENUMS.KNOXIQ_SCAN_STATUS.ERRORED,
        dast: ENUMS.KNOXIQ_SCAN_STATUS.ERRORED,
      });

      await render(hbs`
        <FileDetails::ScanActions
          @file={{this.file}}
          @isKnoxiqEnabled={{true}}
          @knoxiqStatuses={{this.knoxiqStatuses}}
        />
      `);

      assert.dom().containsText(t('knoxIq.statusChip.failed'));
      assert.dom().doesNotContainText(t('knoxIq.statusChip.running'));
    });

    test('it does not render KnoxIQ status chips when scan is not automated', async function (assert) {
      this.file.isKnoxiqAutomated = false;

      await render(hbs`
        <FileDetails::ScanActions
          @file={{this.file}}
          @isKnoxiqEnabled={{true}}
          @knoxiqStatuses={{this.knoxiqStatuses}}
        />
      `);

      assert
        .dom('[data-test-fileDetailScanActions-staticScanCompletedStatus]')
        .exists();
      assert.dom().doesNotContainText(t('knoxIq.statusChip.running'));
      assert.dom().doesNotContainText(t('knoxIq.statusChip.failed'));
    });
  }
);
