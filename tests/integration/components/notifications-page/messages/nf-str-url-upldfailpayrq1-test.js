import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NotificationMap } from 'irene/components/notifications-page/notification_map';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-str-url-upldfailpayrq1',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    const messageCode = 'NF_STR_URL_UPLDFAILPAYRQ1';
    const ContextClass = NotificationMap[messageCode].context;

    test('it renders', async function (assert) {
      assert.expect(3);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode,
        context: new ContextClass({
          package_name: 'com.appknox.mfva',
          store_url: 'https://play.google.com/mfva',
          error_message: 'failed due to Insufficient Credits Error',
        }),
      });

      this.context = this.notification.context;

      await render(
        hbs`<NotificationsPage::Messages::NfStrUrlUpldfailpayrq1 @notification={{this.notification}} @context={{this.context}}/>`
      );

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-nf-str-url-upldfailpayrq1-primary-message]',
        message: t('notificationModule.messages.nf-str-url-upldfailpayrq1', {
          store_name: t('googlePlayStore'),
        }),
      });

      assert
        .dom('[data-test-nf-str-url-upldfailpayrq1-link]')
        .exists()
        .containsText(`${t('notificationModule.viewAppOnStore')}`);
    });
  }
);
