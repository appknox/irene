import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { NotificationMap } from 'irene/components/notifications-page/notification_map';

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
  primaryMessage: '[data-test-nf-sbom-comp-update-primary-message]',
  componentName: '[data-test-nf-sbom-comp-update-component-name]',
  newVersion: '[data-test-nf-sbom-comp-update-new-version]',
  affects: '[data-test-nf-sbom-comp-update-affects]',
  viewComponentBtn: '[data-test-nf-sbom-comp-update-link]',
  viewDirectoryBtn: '[data-test-nf-sbom-comp-update-directory-link]',
};

// ─── Template ───
const TEMPLATE = hbs`
  <NotificationsPage::Messages::NfSbomCompUpdate
    @notification={{this.notification}}
    @context={{this.context}}
  />
`;

// ─── Test suite ───
module(
  'Integration | Component | notifications-page/messages/nf-sbom-comp-update',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    const messageCode = 'NF_SBOM_COMP_UPDATE';
    const ContextClass = NotificationMap[messageCode].context;

    const baseContext = {
      component_name: 'npm::lodash',
      old_version: '4.17.20',
      new_version: '4.17.21',
      source: 'npm',
      affected_apps_count: 3,
      name: '',
      registry_url: 'https://registry.npmjs.org/package/lodash',
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

    test('it renders the component update details', async function (assert) {
      await this.renderMessage(baseContext);

      assert
        .dom(selectors.primaryMessage)
        .hasText(t('notificationModule.messages.nf-sbom-comp-update'));

      assert.dom(selectors.componentName).hasText('lodash');

      assert
        .dom(selectors.newVersion)
        .hasText(`${t('notificationModule.newVersion')}: 4.17.21`);

      assert
        .dom(selectors.affects)
        .hasText(`${t('notificationModule.affects')}: 3 ${t('appOrS')}`);

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

    test('it opens the registry url', async function (assert) {
      await this.renderMessage(baseContext);

      await click(selectors.viewDirectoryBtn);

      const window = this.owner.lookup('service:browser/window');

      assert.strictEqual(
        window.url,
        'https://registry.npmjs.org/package/lodash'
      );
      assert.strictEqual(window.target, '_blank');
    });

    test('it does not open a url when registry url is empty', async function (assert) {
      await this.renderMessage({ ...baseContext, registry_url: '' });

      await click(selectors.viewDirectoryBtn);

      const window = this.owner.lookup('service:browser/window');

      assert.strictEqual(window.url, null);
    });
  }
);
