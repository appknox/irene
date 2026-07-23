import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NfAutomatedDastPartiallyCompletedContext } from 'irene/components/notifications-page/messages/nf-automated-dast-partially-completed/context';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

// ─── Selectors ───────────────────────────────────────────────────────────────

const SEL = {
  primaryMessage:
    '[data-test-nf-automated-dast-partially-completed-primary-message]',
  fileLink: '[data-test-nf-automated-dast-partially-completed-fileLink]',
  viewResultsLink:
    '[data-test-nf-automated-dast-partially-completed-viewResultsLink]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <NotificationsPage::Messages::NfAutomatedDastPartiallyCompleted
    @notification={{this.notification}}
    @context={{this.context}}
  />
`;

// ─── Test suite ───────────────────────────────────────────────────────────────

module(
  'Integration | Component | notifications-page/messages/nf-automated-dast-partially-completed',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      const notification = this.server.create('nf-in-app-notification', {
        hasRead: false,
        messageCode: 'NF_AUTOMATED_DAST_PARTIALLY_COMPLETED',
        context: new NfAutomatedDastPartiallyCompletedContext({
          file_id: 56,
          package_name: 'com.appknox.mfva',
          platform: 'Android',

          manual_dast_url:
            'http://localhost:4200/dashboard/file/56/dynamic-scan/manual',

          failed_role_names: [
            { id: 12, name: 'User Role #2' },
            { id: 10, name: 'User Role #1' },
          ],
        }),
      });

      this.setProperties({ notification, context: notification.context });
    });

    // ─── Rendering ───────────────────────────────────────────────────────────

    test('renders the prefix message text', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(SEL.primaryMessage)
        .containsText(
          t(
            'notificationModule.messages.nf-automated-dast-partially-completed.prefix'
          )
        );
    });

    test('renders the file link with the correct file ID', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(SEL.fileLink)
        .containsText(t('fileID'))
        .containsText(String(this.context.file_id));
    });

    test('renders the suffix with the platform and package name', async function (assert) {
      assert.expect(1);

      await render(TEMPLATE);

      compareInnerHTMLWithIntlTranslation(assert, {
        doIncludesCheck: true,
        selector: SEL.primaryMessage,
        message: t(
          'notificationModule.messages.nf-automated-dast-partially-completed.suffix',
          {
            platform_display: this.context.platform,
            package_name: this.context.package_name,
          }
        ),
      });
    });

    test('renders the View Results link pointing to the dynamic scan results', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(SEL.viewResultsLink)
        .hasAttribute('href', /dynamic-scan\/results/)
        .hasText(t('viewResults'));
    });
  }
);
