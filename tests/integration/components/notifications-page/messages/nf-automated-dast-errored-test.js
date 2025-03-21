import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NfAutomatedDastErroredContext } from 'irene/components/notifications-page/messages/nf-automated-dast-errored/context';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-automated-dast-errored',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    test('it renders', async function (assert) {
      assert.expect(6);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_AUTOMATED_DAST_ERRORED',
        context: new NfAutomatedDastErroredContext({
          file_id: 1,
          package_name: 'com.mfva.test',
          platform: 'Android',
          error_message: 'error_message',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`
        <NotificationsPage::Messages::NfAutomatedDastErrored 
          @notification={{this.notification}}
          @context={{this.context}}   
        />
      `);

      assert
        .dom('[data-test-nf-automated-dast-errored-primary-message]')
        .containsText(
          t('notificationModule.messages.nf-automated-dast-errored.prefix')
        );

      assert
        .dom('[data-test-nf-automated-dast-errored-manualDASTLink]')
        .hasAttribute('href', /dynamic-scan\/manual/)
        .hasText(t('here'));

      compareInnerHTMLWithIntlTranslation(assert, {
        doIncludesCheck: true,
        selector: '[data-test-nf-automated-dast-errored-primary-message]',
        message: t(
          'notificationModule.messages.nf-automated-dast-errored.suffix',
          {
            error_message: this.context.error_message,
            platform_display: this.context.platform,
            package_name: this.context.package_name,
          }
        ),
      });

      assert
        .dom('[data-test-nf-automated-dast-errored-fileLink]')
        .containsText(t('fileID'))
        .containsText(this.context.file_id);
    });
  }
);
