import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module(
  'Integration | Component | notifications-page/messages/nf-nsrejctd2',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    const ContextClass = NotificationMap['NF_NSREJCTD2'].context;

    test('it renders', async function (assert) {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_NSREJCTD2',
        context: new ContextClass({
          namespace_id: 12,
          namespace_created_on: new Date(),
          namespace_value: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
          requester_username: 'appknox_requester',
          moderator_username: 'appknox_moderator',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`<NotificationsPage::Messages::NfNsrejctd2 @notification={{this.notification}}
      @context={{this.context}}/>`);

      assert
        .dom('[data-test-nf-nsrejctd2-primary-message]')
        .exists()
        .hasText(
          t('notificationModule.messages.nf-nsrejctd2', {
            platform_display: 'android',
            namespace_value: 'com.mfva.test',
            requester_username: 'appknox_requester',
            moderator_username: 'appknox_moderator',
          })
        );

      assert
        .dom('[data-test-nf-nsrejctd2-link]')
        .exists()
        .hasText(t('notificationModule.viewNamespaces'));
    });
  }
);
