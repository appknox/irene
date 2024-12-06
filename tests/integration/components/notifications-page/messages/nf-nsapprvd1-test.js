import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NotificationMap } from 'irene/components/notifications-page/notification_map';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-nsapprvd1',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    const ContextClass = NotificationMap['NF_NSAPPRVD1'].context;

    test('it renders', async function (assert) {
      assert.expect(1);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_NSAPPRVD1',
        context: new ContextClass({
          namespace_id: '20',
          namespace_created_on: new Date(),
          namespace_value: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
          moderator_username: 'appknox_user',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`
        <NotificationsPage::Messages::NfNsapprvd1 
          @notification={{this.notification}}
          @context={{this.context}}
        />
      `);

      this.intl = this.owner.lookup('service:intl');

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-nf-nsapprvd1-primary-message]',
        message: t('notificationModule.messages.nf-nsapprvd1', {
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
          namespace_created_on: this.intl.formatDate(
            this.context.namespace_created_on,
            { month: 'long', year: 'numeric', day: 'numeric' }
          ),
          moderator_username: 'appknox_user',
        }),
      });
    });
  }
);
