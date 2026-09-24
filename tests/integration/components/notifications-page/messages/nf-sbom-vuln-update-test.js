import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NotificationMap } from 'irene/components/notifications-page/notification_map';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

class RouterStub extends Service {
  transitionArgs = null;

  transitionTo(...args) {
    this.transitionArgs = args;
  }
}

class WindowStub extends Service {
  url = null;
  target = null;

  open(url, target) {
    this.url = url;
    this.target = target;
  }
}

// ─── Selectors ───
const selectors = {
  primaryMessage: '[data-test-nf-sbom-vuln-update-primary-message]',
  componentName: '[data-test-nf-sbom-vuln-update-component-name]',
  advisory: '[data-test-nf-sbom-vuln-update-advisory]',
  fixedVersion: '[data-test-nf-sbom-vuln-update-fixed-version]',
  affects: '[data-test-nf-sbom-vuln-update-affects]',
  viewComponentBtn: '[data-test-nf-sbom-vuln-update-link]',
  viewDirectoryBtn: '[data-test-nf-sbom-vuln-update-directory-link]',
};

// ─── Template ───
const TEMPLATE = hbs`
  <NotificationsPage::Messages::NfSbomVulnUpdate
    @notification={{this.notification}}
    @context={{this.context}}
  />
`;

// ─── Test suite ───
module(
  'Integration | Component | notifications-page/messages/nf-sbom-vuln-update',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    const messageCode = 'NF_SBOM_VULN_UPDATE';
    const ContextClass = NotificationMap[messageCode].context;

    const baseContext = {
      component_name: 'npm::lodash',
      ghsa_ids: ['GHSA-1111-2222-3333', 'GHSA-4444-5555-6666'],
      max_severity: 'high',
      fixed_version: '4.17.21',
      affected_apps_count: 2,
      name: '',
      advisory_urls: ['https://example.com/advisory/1'],
    };

    hooks.beforeEach(async function () {
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);
      this.owner.register('service:browser/window', WindowStub);

      this.renderMessage = async (inputJson) => {
        this.notification = this.server.create('nf-in-app-notification', {
          hasRead: true,
          messageCode,
          context: new ContextClass(inputJson),
        });

        this.context = this.notification.context;

        await render(TEMPLATE);
      };
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('it renders the vulnerability update details', async function (assert) {
      assert.expect(7);

      await this.renderMessage(baseContext);

      const expectedMessage = t(
        'notificationModule.messages.nf-sbom-vuln-update',
        { max_severity: 'high', htmlSafe: true }
      ).toString();

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: selectors.primaryMessage,
        message: expectedMessage,
      });

      assert.dom(selectors.componentName).hasText('lodash');

      assert
        .dom(selectors.advisory)
        .hasText(
          `${t('notificationModule.advisory')}: GHSA-1111-2222-3333, GHSA-4444-5555-6666`
        );

      assert
        .dom(selectors.fixedVersion)
        .hasText(`${t('notificationModule.fixedInVersion')}: 4.17.21`);

      assert
        .dom(selectors.affects)
        .hasText(`${t('notificationModule.affects')}: 2 ${t('appOrS')}`);

      assert
        .dom(selectors.viewComponentBtn)
        .hasText(t('notificationModule.viewComponent'));

      assert
        .dom(selectors.viewDirectoryBtn)
        .hasText(t('notificationModule.viewDirectory'));
    });

    test.each(
      'it resolves the display name',
      [
        [{ name: 'Lodash' }, 'Lodash'],
        [{ component_name: 'npm::lodash' }, 'lodash'],
        [{ component_name: 'lodash' }, 'lodash'],
      ],
      async function (assert, [overrides, expectedName]) {
        await this.renderMessage({ ...baseContext, ...overrides });

        assert.dom(selectors.componentName).hasText(expectedName);
      }
    );

    // ─── Actions ───────────────────────────────────────────────────────────────

    test('it navigates to the component inventory', async function (assert) {
      await this.renderMessage(baseContext);

      await click(selectors.viewComponentBtn);

      const router = this.owner.lookup('service:router');

      assert.deepEqual(router.transitionArgs, [
        'authenticated.dashboard.sbom.component-inventory',
        { queryParams: { component_query: 'npm::lodash' } },
      ]);
    });

    test('it opens the advisory url', async function (assert) {
      await this.renderMessage(baseContext);

      await click(selectors.viewDirectoryBtn);

      const window = this.owner.lookup('service:browser/window');

      assert.strictEqual(window.url, 'https://example.com/advisory/1');
      assert.strictEqual(window.target, '_blank');
    });

    test('it falls back to the github advisory url', async function (assert) {
      await this.renderMessage({ ...baseContext, advisory_urls: [] });

      await click(selectors.viewDirectoryBtn);

      const window = this.owner.lookup('service:browser/window');

      assert.strictEqual(
        window.url,
        'https://github.com/advisories/GHSA-1111-2222-3333'
      );
      assert.strictEqual(window.target, '_blank');
    });
  }
);
