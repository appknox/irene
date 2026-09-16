import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, render } from '@ember/test-helpers';
import { Response } from 'miragejs';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

const TAKEN_DOWN_DETAIL =
  'This app has been taken down from the store and can no longer be approved. ' +
  'You can reject it to remove it from this list.';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

class SkPendingReviewStub extends Service {
  singleUpdate = false;

  reload() {
    // no-op: this test only cares about the approve/reject request itself,
    // not the follow-up list refresh.
  }
}

module(
  'Integration | Component | storeknox/inventory/pending-review/table/status',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:sk-pending-review', SkPendingReviewStub);

      const store = this.owner.lookup('service:store');

      const appMetadata = this.server.create('sk-app-metadata');

      const skApp = this.server.create('sk-app', 'withPendingReviewStatus', {
        app_metadata: appMetadata,
      });

      this.skApp = store.push(
        store.normalize('sk-app', {
          ...skApp.toJSON(),
          app_metadata: appMetadata.toJSON(),
        })
      );
    });

    test('a takedown error is surfaced verbatim to the user', async function (assert) {
      this.server.put(
        '/v2/sk_app/:id/update_approval_status',
        () => new Response(400, {}, { detail: TAKEN_DOWN_DETAIL })
      );

      await render(
        hbs`<Storeknox::Inventory::PendingReview::Table::Status
              @data={{this.skApp}}
            />`
      );

      await click(
        '[data-test-storeknoxInventory-pendingReviewTable-approveBtn]'
      );

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        TAKEN_DOWN_DETAIL,
        'the backend reason must reach the toast, not a generic message'
      );
    });

    test('rejecting a taken-down app still succeeds', async function (assert) {
      this.server.put('/v2/sk_app/:id/update_approval_status', () => ({
        id: this.skApp.id,
        approval_status: ENUMS.SK_APPROVAL_STATUS.REJECTED,
        approval_status_display: 'Rejected',
      }));

      await render(
        hbs`<Storeknox::Inventory::PendingReview::Table::Status
              @data={{this.skApp}}
            />`
      );

      await click(
        '[data-test-storeknoxInventory-pendingReviewTable-rejectBtn]'
      );

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        null,
        'reject is the only action left to the customer and must never break'
      );
    });
  }
);
