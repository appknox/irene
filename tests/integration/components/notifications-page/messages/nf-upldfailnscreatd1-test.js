import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NotificationMap } from 'irene/components/notifications-page/notification_map';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-upldfailnscreatd1',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    const ContextClass = NotificationMap['NF_UPLDFAILNSCREATD1'].context;

    test('it renders', async function (assert) {
      assert.expect(1);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_UPLDFAILNSCREATD1',
        context: new ContextClass({
          namespace_value: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`
        <NotificationsPage::Messages::NfUpldfailnscreatd1 
          @notification={{this.notification}}
          @context={{this.context}}
        />
      `);

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-nf-upldfailnscreatd1-primary-message]',
        message: t('notificationModule.messages.nf-upldfailnscreatd1', {
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
        }),
      });
    });
  }
);
