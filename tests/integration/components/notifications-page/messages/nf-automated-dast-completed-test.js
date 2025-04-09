import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NfAutomatedDastCompletedContext } from 'irene/components/notifications-page/messages/nf-automated-dast-completed/context';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-automated-dast-completed',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    test('it renders', async function (assert) {
      assert.expect(6);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_AUTOMATED_DAST_COMPLETED',
        context: new NfAutomatedDastCompletedContext({
          file_id: 1,
          package_name: 'com.mfva.test',
          platform: 'Android',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`
        <NotificationsPage::Messages::NfAutomatedDastCompleted 
          @notification={{this.notification}}
          @context={{this.context}}   
        />
      `);

      assert
        .dom('[data-test-nf-automated-dast-completed-primary-message]')
        .containsText(
          t('notificationModule.messages.nf-automated-dast-completed.prefix')
        );

      assert
        .dom('[data-test-nf-automated-dast-completed-fileLink]')
        .containsText(t('fileID'))
        .containsText(this.context.file_id);

      compareInnerHTMLWithIntlTranslation(assert, {
        doIncludesCheck: true,
        selector: '[data-test-nf-automated-dast-completed-primary-message]',
        message: t(
          'notificationModule.messages.nf-automated-dast-completed.suffix',
          {
            platform_display: this.context.platform,
            package_name: this.context.package_name,
          }
        ),
      });

      assert
        .dom('[data-test-nf-automated-dast-completed-viewResultsLink]')
        .hasAttribute('href', /dynamic-scan\/results/)
        .hasText(t('viewResults'));
    });
  }
);
