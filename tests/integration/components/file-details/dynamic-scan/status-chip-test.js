import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

import { DsStatusGroup } from 'irene/utils/ds-status-group';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  chip: '[data-test-fileDetails-dynamicScan-statusChip]',
  loader: '[data-test-fileDetails-dynamicScan-statusChip-loader]',
  error: '[data-test-fileDetails-dynamicScan-statusChip-error]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<FileDetails::DynamicScan::StatusChip
  @status={{this.status}}
  @errorMessage={{this.errorMessage}}
/>`;

module(
  'Integration | Component | file-details/dynamic-scan/status-chip',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        status: DsStatusGroup.ERRORED,
        errorMessage: 'Device disconnected mid-scan',
      });
    });

    test('an errored scan shows the reason under the chip', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.error)
        .hasText('Device disconnected mid-scan', 'the backend reason is shown');
    });

    test('a non-errored status shows no reason even when one is passed', async function (assert) {
      this.set('status', DsStatusGroup.RUNNING);

      await render(TEMPLATE);

      assert
        .dom(selectors.error)
        .doesNotExist(
          'a stale message from an earlier failure must not linger'
        );
    });

    test('an errored scan with no reason shows no empty line', async function (assert) {
      this.set('errorMessage', null);

      await render(TEMPLATE);

      assert.dom(selectors.error).doesNotExist();
      assert.dom(selectors.chip).exists('the chip itself still renders');
    });
  }
);
