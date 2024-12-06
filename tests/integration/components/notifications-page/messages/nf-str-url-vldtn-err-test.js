import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NotificationMap } from 'irene/components/notifications-page/notification_map';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-str-url-vldtn-err',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    const messageCode = 'NF_STR_URL_VLDTN_ERR';
    const ContextClass = NotificationMap[messageCode].context;

    test('it renders', async function (assert) {
      assert.expect(7);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode,
        context: new ContextClass({
          store_url: 'https://apps.apple.com/mfva',
          error_message: 'Invalid URL. URL is not valid',
        }),
      });

      this.context = this.notification.context;

      await render(
        hbs`<NotificationsPage::Messages::NfStrUrlVldtnErr @notification={{this.notification}} @context={{this.context}}/>`
      );

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-nf-str-url-vldtn-err-primary-message]',
        message: t('notificationModule.messages.nf-str-url-vldtn-err', {
          store_name: t('appleAppStore'),
        }),
      });

      assert
        .dom('[data-test-nf-str-url-vldtn-err-errorLabel]')
        .exists()
        .hasText(t('errorMessage'));

      assert
        .dom('[data-test-nf-str-url-vldtn-err-errorValue]')
        .exists()
        .hasText(this.context.error_message);

      assert
        .dom('[data-test-nf-str-url-vldtn-err-link]')
        .exists()
        .containsText(`${t('notificationModule.viewAppOnStore')}`);
    });
  }
);
