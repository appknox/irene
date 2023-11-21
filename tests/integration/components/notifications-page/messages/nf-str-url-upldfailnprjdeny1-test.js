import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module(
  'Integration | Component | notifications-page/messages/nf-str-url-upldfailnprjdeny1',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    const messageCode = 'NF_STR_URL_UPLDFAILNPRJDENY1';
    const ContextClass = NotificationMap[messageCode].context;

    test('it renders', async function (assert) {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode,
        context: new ContextClass({
          package_name: 'com.appknox.mfva',
          platform_display: 'Andriod',
          platform: 0,
          store_url: 'https://play.google.com/mfva',
          error_message: "You don't have permission to upload to project",
        }),
      });

      this.context = this.notification.context;

      await render(
        hbs`<NotificationsPage::Messages::NfStrUrlUpldfailnprjdeny1 @notification={{this.notification}} @context={{this.context}}/>`
      );

      assert
        .dom('[data-test-nf-str-url-upldfailnprjdeny1-primary-message]')
        .exists()
        .hasText(
          t('notificationModule.messages.nf-str-url-upldfailnprjdeny1', {
            package_name: this.context.package_name,
            store_name: t('googlePlaystoreLowercase'),
          })
        );

      assert
        .dom('[data-test-nf-str-url-upldfailnprjdeny1-link]')
        .exists()
        .containsText(`${t('notificationModule.viewAppOnStore')}`);
    });
  }
);
