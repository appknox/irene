import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module(
  'Integration | Component | notifications-page/messages/nf-str-url-upldfailpay2',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    const messageCode = 'NF_STR_URL_UPLDFAILPAY2';
    const ContextClass = NotificationMap[messageCode].context;

    test('it renders', async function (assert) {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode,
        context: new ContextClass({
          package_name: 'com.appknox.mfva',
          requester_username: 'test_user',
          store_url: 'https://play.google.com/mfva',
          error_message: 'failed due to Insufficient Credits Error',
        }),
      });

      this.context = this.notification.context;

      await render(
        hbs`<NotificationsPage::Messages::NfStrUrlUpldfailpay2 @notification={{this.notification}} @context={{this.context}}/>`
      );

      assert
        .dom('[data-test-nf-str-url-upldfailpay2-primary-message]')
        .exists()
        .hasText(
          t('notificationModule.messages.nf-str-url-upldfailpay2', {
            package_name: this.context.package_name,
            requester_username: this.context.requester_username,
            store_name: t('googlePlaystoreLowercase'),
          })
        );

      assert
        .dom('[data-test-nf-str-url-upldfailpay2-link]')
        .exists()
        .containsText(`${t('notificationModule.viewAppOnStore')}`);
    });
  }
);
