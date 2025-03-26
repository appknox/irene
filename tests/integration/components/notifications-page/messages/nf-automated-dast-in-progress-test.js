import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NfAutomatedDastInProgressContext } from 'irene/components/notifications-page/messages/nf-automated-dast-in-progress/context';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-automated-dast-in-progress',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    test('it renders', async function (assert) {
      assert.expect(4);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_AUTOMATED_DAST_IN_PROGRESS',
        context: new NfAutomatedDastInProgressContext({
          file_id: 1,
          package_name: 'com.mfva.test',
          platform: 'Android',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`
        <NotificationsPage::Messages::NfAutomatedDastInProgress 
          @notification={{this.notification}}
          @context={{this.context}}   
        />
      `);

      assert
        .dom('[data-test-nf-automated-dast-in-progress-primary-message]')
        .containsText(
          t('notificationModule.messages.nf-automated-dast-in-progress.prefix')
        );

      compareInnerHTMLWithIntlTranslation(assert, {
        doIncludesCheck: true,
        selector: '[data-test-nf-automated-dast-in-progress-primary-message]',
        message: t(
          'notificationModule.messages.nf-automated-dast-in-progress.suffix',
          {
            platform_display: this.context.platform,
            package_name: this.context.package_name,
          }
        ),
      });

      assert
        .dom('[data-test-nf-automated-dast-in-progress-fileLink]')
        .containsText(t('fileID'))
        .containsText(this.context.file_id);
    });
  }
);
