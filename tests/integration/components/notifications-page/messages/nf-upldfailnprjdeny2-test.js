import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module(
  'Integration | Component | notifications-page/messages/nf-upldfailnprjdeny2',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    const ContextClass = NotificationMap['NF_UPLDFAILNPRJDENY2'].context;

    test('it renders', async function (assert) {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_UPLDFAILNPRJDENY2',
        context: new ContextClass({
          project_id: '20',
          package_name: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
          requester_username: 'appknox_requester',
          requester_role: 'member',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`<NotificationsPage::Messages::NfUpldfailnprjdeny2 @notification={{this.notification}}
      @context={{this.context}}/>`);

      assert
        .dom('[data-test-nf-upldfailnprjdeny2-primary-message]')
        .exists()
        .hasText(
          t('notificationModule.messages.nf-upldfailnprjdeny2.primary', {
            platform_display: 'android',
            package_name: 'com.mfva.test',
            requester_username: 'appknox_requester',
            requester_role: 'member',
          })
        );

      assert
        .dom('[data-test-nf-upldfailnprjdeny2-secodary-message]')
        .exists()
        .hasText(
          `(${t('notificationModule.messages.nf-upldfailnprjdeny2.secondary')})`
        );

      assert
        .dom('[data-test-nf-upldfailnprjdeny2-link]')
        .exists()
        .hasText(t('notificationModule.projectSettings'));
    });
  }
);
