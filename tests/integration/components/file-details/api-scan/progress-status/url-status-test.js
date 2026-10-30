import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  root: '[data-test-fileDetails-apiScan-progressStatus-status]',
  label: '[data-test-fileDetails-apiScan-progressStatus-statusLabel]',
  loader: '[data-test-fileDetails-apiScan-progressStatus-statusLoader]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <FileDetails::ApiScan::ProgressStatus::UrlStatus @status={{this.status}} />
`;

// ─── Test suite ────────────────────────────────────────────────────────────────
module(
  'Integration | Component | file-details/api-scan/progress-status/url-status',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    test.each(
      'it renders the label for each status',
      [
        [ENUMS.API_SCAN_URL_STATUS.PENDING, 'apiScanModule.queued'],
        [ENUMS.API_SCAN_URL_STATUS.IN_PROGRESS, 'scanning'],
        [ENUMS.API_SCAN_URL_STATUS.COMPLETED, 'apiScanModule.scanned'],
        [ENUMS.API_SCAN_URL_STATUS.FAILED, 'failed'],
        [ENUMS.API_SCAN_URL_STATUS.CANCELLED, 'cancelled'],
        [ENUMS.API_SCAN_URL_STATUS.UNKNOWN, 'apiScanModule.queued'],
      ],
      async function (assert, [status, labelKey]) {
        this.set('status', status);

        await render(TEMPLATE);

        assert.dom(selectors.label).hasText(t(labelKey));
      }
    );

    test('it shows the loader only while the endpoint is being scanned', async function (assert) {
      this.set('status', ENUMS.API_SCAN_URL_STATUS.IN_PROGRESS);

      await render(TEMPLATE);

      assert.dom(selectors.loader).exists();

      this.set('status', ENUMS.API_SCAN_URL_STATUS.COMPLETED);
      await settled();

      assert.dom(selectors.loader).doesNotExist();
      assert.dom(selectors.label).hasText(t('apiScanModule.scanned'));
    });
  }
);
