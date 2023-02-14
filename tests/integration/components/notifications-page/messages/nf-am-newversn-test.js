import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NfAmNewversnContext } from 'irene/components/notifications-page/messages/nf-am-newversn/context';

module(
  'Integration | Component | notifications-page/messages/nf-am-newversn',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    test('it renders', async function (assert) {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_AM_NEWVERSN',
        context: new NfAmNewversnContext({
          package_name: 'com.mfva.test',
          app_name: 'mfva',
          am_app_version_id: 20,
          am_app_id: 12,
          project_id: 200,
          platform: 1,
          platform_display: 'android',
          version_unscanned: '1.0.1',
          version_scanned: '1.0.0',
        }),
      });
      this.context = this.notification.context;
      await render(hbs`<NotificationsPage::Messages::NfAmNewversn @notification={{this.notification}}
      @context={{this.context}} />`);
      assert.dom().containsText(
        t('notificationModule.messages.nf-am-newversn', {
          platform_display: 'android',
          app_name: 'mfva',
          package_name: 'com.mfva.test',
          version_unscanned: '1.0.1',
        })
      );
    });
  }
);
