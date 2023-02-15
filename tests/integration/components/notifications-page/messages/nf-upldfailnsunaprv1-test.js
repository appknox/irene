import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module(
  'Integration | Component | notifications-page/messages/nf-upldfailnsunaprv1',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    const ContextClass = NotificationMap['NF_UPLDFAILNSUNAPRV1'].context;

    test('it renders', async function (assert) {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_UPLDFAILNSUNAPRV1',
        context: new ContextClass({
          namespace_value: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`<NotificationsPage::Messages::NfUpldfailnsunaprv1 @notification={{this.notification}}
      @context={{this.context}}/>`);

      assert.dom().containsText(
        t('notificationModule.messages.nf-upldfailnsunaprv1', {
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
        })
      );
    });
  }
);
