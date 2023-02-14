import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module(
  'Integration | Component | notifications-page/messages/nf-nsautoapprvd2',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    const ContextClass = NotificationMap['NF_NSAUTOAPPRVD2'].context;

    test('it renders', async function (assert) {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_NSAPPRVD1',
        context: new ContextClass({
          namespace_id: '20',
          namespace_created_on: new Date(),
          namespace_value: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
          requester_username: 'appknox_user',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`<NotificationsPage::Messages::NfNsautoapprvd2 @notification={{this.notification}}
      @context={{this.context}}/>`);

      assert.dom().hasText(
        t('notificationModule.messages.nf-nsautoapprvd2', {
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
          requester_username: 'appknox_user',
        })
      );
    });
  }
);
