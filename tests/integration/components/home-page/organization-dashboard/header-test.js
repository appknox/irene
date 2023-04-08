import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }
  success(msg) {
    this.successMsg = msg;
  }
}

class FreshdeskStub extends Service {
  isSupportWidgetEnabled = false;
}

module(
  'Integration | Component | home-page/organization-dashboard/header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const organizationMe = store.createRecord('organization-me', {
        is_owner: true,
        is_admin: true,
      });

      class OrganizationMeStub extends Service {
        org = organizationMe;
      }

      await this.owner.lookup('service:organization').load();

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:freshdesk', FreshdeskStub);

      const organization = this.owner.lookup('service:organization');

      this.setProperties({
        organization: organization,
        user: store.createRecord('user', this.server.create('user').toJSON()),
      });
    });

    test.each(
      'it renders organization-dashboard header',
      [{ knowledgeBase: true }, {}],
      async function (assert, { securityDashboard, knowledgeBase }) {
        this.setProperties({
          isSecurityEnabled: securityDashboard,
        });

        const freshdesk = this.owner.lookup('service:freshdesk');
        freshdesk.isSupportWidgetEnabled = knowledgeBase;

        await render(hbs`
        <HomePage::OrganizationDashboard::Header @user={{this.user}} @isSecurityEnabled={{this.isSecurityEnabled}} />
      `);

        assert.dom('[data-test-organizationDashboardHeader]').exists();

        assert
          .dom('[data-test-organizationDashboardHeader-startScanLabel]')
          .hasText('t:startNewScan:()');

        assert.dom('[data-test-uploadApp-root]').exists();

        assert.dom('[data-test-uploadApp-uploadBtn]').hasText('t:uploadApp:()');

        if (knowledgeBase) {
          assert
            .dom('[data-test-organizationDashboardHeader-KnowledgeBaseBtn]')
            .isNotDisabled()
            .hasText('t:knowledgeBase:()');
        } else {
          assert
            .dom('[data-test-organizationDashboardHeader-KnowledgeBaseBtn]')
            .doesNotExist();
        }

        assert
          .dom('[data-test-organizationDashboardHeader-supportBtn]')
          .isNotDisabled()
          .hasText('t:support:()');

        assert.dom('[data-test-bell-icon]').isNotDisabled();

        assert
          .dom('[data-test-organizationDashboardHeader-profileBtn]')
          .isNotDisabled()
          .hasText(this.user.username);
      }
    );

    test('test Knowledge Base click', async function (assert) {
      assert.expect(5);

      const freshdesk = this.owner.lookup('service:freshdesk');

      freshdesk.isSupportWidgetEnabled = true;

      freshdesk.openSupportWidget = function () {
        assert.ok('Knowledge base clicked');
        assert.strictEqual(arguments.length, 0);
      };

      await render(hbs`
        <HomePage::OrganizationDashboard::Header @user={{this.user}} />
      `);

      assert.dom('[data-test-organizationDashboardHeader]').exists();

      assert
        .dom('[data-test-organizationDashboardHeader-KnowledgeBaseBtn]')
        .isNotDisabled()
        .hasText('t:knowledgeBase:()');

      await click('[data-test-organizationDashboardHeader-KnowledgeBaseBtn]');
    });

    test('test profile btn and logout', async function (assert) {
      assert.expect(9);

      this.set('logoutAction', () => {
        assert.ok('Logout action called');
      });

      await render(hbs`
        <HomePage::OrganizationDashboard::Header @user={{this.user}} @logoutAction={{this.logoutAction}} />
      `);

      assert.dom('[data-test-organizationDashboardHeader]').exists();

      assert
        .dom('[data-test-organizationDashboardHeader-profileBtn]')
        .isNotDisabled()
        .hasText(this.user.username);

      await click('[data-test-organizationDashboardHeader-profileBtn]');

      assert
        .dom('[data-test-organizationDashboardHeader-profileMenuItem]')
        .exists();

      const menuItems = findAll(
        '[data-test-organizationDashboardHeader-profileMenuItem]'
      );

      assert.dom(menuItems[0]).hasText(this.user.username);
      assert.dom(menuItems[1]).hasText(this.user.email);
      assert.dom(menuItems[2]).hasText('t:logout:()');

      await click(menuItems[2].querySelector('button'));

      assert
        .dom('[data-test-organizationDashboardHeader-profileMenuItem]')
        .doesNotExist();
    });
  }
);
