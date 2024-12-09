import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NotificationMap } from 'irene/components/notifications-page/notification_map';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-str-url-upldfailnprjdeny2',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    const messageCode = 'NF_STR_URL_UPLDFAILNPRJDENY2';
    const ContextClass = NotificationMap[messageCode].context;

    test('it renders', async function (assert) {
      assert.expect(7);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode,
        context: new ContextClass({
          project_id: 1,
          package_name: 'com.appknox.mfva',
          platform_display: 'Andriod',
          platform: 0,
          requester_username: 'test_user',
          requester_role: 'Admin',
          store_url: 'https://play.google.com/mfva',
          error_message: 'User does not have access to the project',
        }),
      });

      this.context = this.notification.context;

      await render(
        hbs`<NotificationsPage::Messages::NfStrUrlUpldfailnprjdeny2 @notification={{this.notification}} @context={{this.context}}/>`
      );

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-nf-str-url-upldfailnprjdeny2-primary-message]',
        message: t(
          'notificationModule.messages.nf-str-url-upldfailnprjdeny2.primary',
          {
            platform_display: this.context.platform_display,
            package_name: this.context.package_name,
            requester_username: this.context.requester_username,
            requester_role: this.context.requester_role,
          }
        ),
      });

      assert
        .dom('[data-test-nf-str-url-upldfailnprjdeny2-secodary-message]')
        .exists()
        .hasText(
          `(${t(
            'notificationModule.messages.nf-str-url-upldfailnprjdeny2.secondary'
          )})`
        );

      assert
        .dom('[data-test-nf-str-url-upldfailnprjdeny2-projectSettingslink]')
        .exists()
        .hasText(t('notificationModule.projectSettings'));

      assert
        .dom('[data-test-nf-str-url-upldfailnprjdeny2-viewAppOnStorelink]')
        .exists()
        .hasText(t('notificationModule.viewAppOnStore'));
    });
  }
);
