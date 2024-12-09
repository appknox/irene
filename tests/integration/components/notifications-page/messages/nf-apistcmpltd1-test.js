import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

module(
  'Integration | Component | notifications-page/messages/nf-apistcmpltd1',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    const ContextClass = NotificationMap['NF_APISTCMPLTD1'].context;

    test('it renders', async function (assert) {
      assert.expect(7);

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_APISTCMPLTD1',
        context: new ContextClass({
          package_name: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
          file_id: '20',
          file_name: 'mfva',
          version: '1.0.1',
          version_code: 23434,
          critical_count: 1,
          high_count: 2,
          medium_count: 3,
          low_count: 4,
          passed_count: 5,
          untested_count: 10,
        }),
      });

      this.context = this.notification.context;

      await render(hbs`
        <NotificationsPage::Messages::NfApistcmpltd1 
          @notification={{this.notification}}
          @context={{this.context}}
        />
      `);

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-nf-apistcmpltd1-primary-message]',
        message: t('notificationModule.messages.nf-apistcmpltd1', {
          platform_display: 'android',
          file_name: 'mfva',
          package_name: 'com.mfva.test',
        }),
      });

      assert
        .dom('[data-test-nf-apistcmpltd1-version]')
        .exists()
        .containsText(
          `${t('versionLowercase')}: 1.0.1 | ${t('versionCode')}: 23434`
        );

      assert
        .dom('[data-test-nf-apistcmpltd1-risk-count]')
        .exists()
        .containsText(
          `${t('notificationModule.currentRiskStatusFile')} ${t(
            'critical'
          )} 1 ${t('high')} 2 ${t('medium')} 3 ${t('low')} 4 ${t(
            'passed'
          )} 5 ${t('untested')} 10`
        );

      assert
        .dom('[data-test-nf-apistcmpltd1-link]')
        .exists()
        .containsText(`${t('viewFile')}`);
    });
  }
);
