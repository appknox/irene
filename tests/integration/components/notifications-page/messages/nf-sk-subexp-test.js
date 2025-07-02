import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import dayjs from 'dayjs';

import { NfSkSubexpContext } from 'irene/components/notifications-page/messages/nf-sk-subexp/context';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-sk-subexp',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    test.each('it renders', [true, false], async function (assert, is_trial) {
      assert.expect(1);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_SK_SUBEXP',
        context: new NfSkSubexpContext({
          organization_name: 'Test Organization',
          weeks_remaining: 2,
          subscription_end_date: '2025-06-25',
          is_trial,
        }),
      });

      this.context = this.notification.context;

      await render(hbs`
        <NotificationsPage::Messages::NfSkSubexp
          @notification={{this.notification}}
          @context={{this.context}}
        />
      `);

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-nf-subexp-primary-message]',
        message: t(
          is_trial
            ? 'notificationModule.messages.nf-sk-subexp-trial'
            : 'notificationModule.messages.nf-sk-subexp',
          {
            sub_expiry_date: dayjs(this.context.subscription_end_date).format(
              'MMM D, YYYY'
            ),
          }
        ),
        doIncludesCheck: true,
      });
    });
  }
);
