import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module(
  'Integration | Component | notifications-page/messages/nf-str-url-upload-success',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    const messageCode = 'NF_STR_URL_UPLOAD_SUCCESS';
    const ContextClass = NotificationMap[messageCode].context;

    test('it renders', async function (assert) {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode,
        context: new ContextClass({
          file_id: 450,
          version: '1.0',
          platform: 0,
          package_name: 'com.appknox.mfva',
          version_code: '6',
          platform_display: 'Android',
          store_url: 'https://play.google.com/mfva',
        }),
      });

      this.context = this.notification.context;

      await render(
        hbs`<NotificationsPage::Messages::NfStrUrlUploadSuccess @notification={{this.notification}} @context={{this.context}}/>`
      );

      assert
        .dom('[data-test-nf-str-url-upload-success-primary-message]')
        .exists()
        .hasText(
          t('notificationModule.messages.nf-str-url-upload-success.prefix', {
            platform_display: this.context.platform_display,
            package_name: this.context.package_name,
            store_name: t('googlePlaystoreLowercase'),
          })
            .concat(` ${t('fileID')} ${this.context.file_id} `)
            .concat(
              t('notificationModule.messages.nf-str-url-upload-success.suffix')
            )
        );

      assert
        .dom('[data-test-nf-str-url-upload-success-version]')
        .exists()
        .hasText(
          `${t('versionLowercase')}: ${this.context.version} | ${t(
            'versionCode'
          )}: ${this.context.version_code}`
        );

      assert
        .dom('[data-test-nf-str-url-upload-success-link]')
        .exists()
        .containsText(`${t('notificationModule.viewAppOnStore')}`);
    });
  }
);
