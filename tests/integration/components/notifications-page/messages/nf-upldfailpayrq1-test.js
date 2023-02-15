import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module(
  'Integration | Component | notifications-page/messages/nf-upldfailpayrq1',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    const ContextClass = NotificationMap['NF_UPLDFAILPAYRQ1'].context;

    test('it renders', async function (assert) {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_UPLDFAILPAYRQ1',
        context: new ContextClass({
          package_name: 'com.mfva.test',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`<NotificationsPage::Messages::NfUpldfailpayrq1 @notification={{this.notification}}
      @context={{this.context}}/>`);

      assert.dom().containsText(
        t('notificationModule.messages.nf-upldfailpayrq1', {
          package_name: 'com.mfva.test',
        })
      );
    });
  }
);
