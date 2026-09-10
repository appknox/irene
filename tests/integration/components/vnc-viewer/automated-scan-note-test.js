import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

import ENUMS from 'irene/enums';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  note: '[data-test-vncViewer-automatedNote]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<VncViewer::AutomatedScanNote
  @dynamicScan={{this.dynamicScan}}
/>`;

module(
  'Integration | Component | vnc-viewer/automated-scan-note',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');

      this.pushScan = (status) => {
        const record = this.server.create('dynamicscan', { status });

        return store.push(store.normalize('dynamicscan', record.toJSON()));
      };
    });

    test('a queued scan is described as waiting', async function (assert) {
      this.set(
        'dynamicScan',
        this.pushScan(ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE)
      );

      await render(TEMPLATE);

      assert.dom(selectors.note).containsText(t('note'));
      assert.dom(selectors.note).containsText(t('automatedScanQueuedVncNote'));
    });

    test('a running scan is described as in progress', async function (assert) {
      this.set(
        'dynamicScan',
        this.pushScan(ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION)
      );

      await render(TEMPLATE);

      assert.dom(selectors.note).containsText(t('automatedScanRunningVncNote'));

      assert
        .dom(selectors.note)
        .doesNotContainText(t('automatedScanQueuedVncNote'));
    });
  }
);
