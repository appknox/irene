import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module(
  'Integration | Component | notifications-page/messages/nf-sbomcmpltd',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    const messageCode = 'NF_SBOMCMPLTD';
    const ContextClass = NotificationMap[messageCode].context;

    test('it renders', async function (assert) {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode,
        context: new ContextClass({
          file_id: 450,
          version: '1.0',
          platform: 0,
          file_name: 'MFVA',
          sb_file_id: 51,
          package_name: 'com.appknox.mfva',
          version_code: '6',
          sb_project_id: 30,
          components_count: 1,
          platform_display: 'Android',
          vulnerable_components_count: 0,
          components_with_updates_count: 0,
        }),
      });

      this.context = this.notification.context;

      await render(
        hbs`<NotificationsPage::Messages::NfSbomcmpltd @notification={{this.notification}} @context={{this.context}}/>`
      );

      assert
        .dom('[data-test-nf-sbomcmpltd-primary-message]')
        .exists()
        .hasText(
          t('notificationModule.messages.nf-sbomcmpltd.prefix')
            .concat(` ${t('fileID')} ${this.context.file_id} `)
            .concat(
              t('notificationModule.messages.nf-sbomcmpltd.suffix', {
                platform_display: this.context.platform_display,
                file_name: this.context.file_name,
                package_name: this.context.package_name,
              })
            )
        );

      assert
        .dom('[data-test-nf-sbomcmpltd-summaryTitle]')
        .hasText(`${t('summary')}:`);

      assert.dom('[data-test-nf-sbomcmpltd-summaryValue]').hasText(
        t('notificationModule.messages.nf-sbomcmpltd.summary', {
          total_components: this.context.components_count,
          vulnerable_components: this.context.vulnerable_components_count,
          outdated_components: this.context.components_with_updates_count,
        })
      );

      assert
        .dom('[data-test-nf-sbomcmpltd-version]')
        .exists()
        .hasText(
          `${t('versionLowercase')}: ${this.context.version} | ${t(
            'versionCode'
          )}: ${this.context.version_code}`
        );

      assert
        .dom('[data-test-nf-sbomcmpltd-link]')
        .exists()
        .containsText(`${t('notificationModule.viewSBOMResults')}`);
    });
  }
);
