import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NotificationMap } from 'irene/components/notifications-page/notification_map';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-public-api-user-updated',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    const ContextClass = NotificationMap['NF_PUBLIC_API_USER_UPDATED'].context;

    test('it renders', async function (assert) {
      assert.expect(1);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_PUBLIC_API_USER_UPDATED',
        context: new ContextClass({
          type: 'role',
          user_email: 'test@example.com',
          current: 'Owner',
          updated: 'Admin',
          changed_by: 'admin@example.com',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`
        <NotificationsPage::Messages::NfPublicApiUserUpdated
          @notification={{this.notification}}
          @context={{this.context}}
        />
      `);

      const expectedMessage = t(
        'notificationModule.messages.nf-public-api-user-updated',
        {
          type: 'role',
          user_email: 'test@example.com',
          current: 'Owner',
          updated: 'Admin',
          changed_by: 'admin@example.com',
          htmlSafe: true,
        }
      ).toString();

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-nf-public-api-user-updated-primary-message]',
        message: expectedMessage,
      });
    });
  }
);
