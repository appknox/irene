import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NfSkNewversnContext } from 'irene/components/notifications-page/messages/nf-sk-newversn/context';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-sk-newversn',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    test('it renders', async function (assert) {
      assert.expect(1);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_SK_NEWVERSN',
        context: new NfSkNewversnContext({
          package_name: 'com.mfva.test',
          app_name: 'mfva',
          sk_app_version_id: 20,
          sk_app_id: 12,
          project_id: 200,
          platform: 1,
          platform_display: 'android',
          version_unscanned: '1.0.1',
          version_scanned: '1.0.0',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`
        <NotificationsPage::Messages::NfSkNewversn 
          @notification={{this.notification}}
          @context={{this.context}}   
        />
      `);

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-nf-newversn-primary-message]',
        message: t('notificationModule.messages.nf-sk-newversn', {
          platform_display: this.context.platform_display,
          app_name: this.context.app_name,
          package_name: this.context.package_name,
          version_unscanned: this.context.version_unscanned,
        }),
      });
    });
  }
);
