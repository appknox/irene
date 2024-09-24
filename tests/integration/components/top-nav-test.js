import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
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
  supportWidgetIsEnabled = false;
  freshchatEnabled = false;
}

class ConfigurationStub extends Service {
  frontendData = {};
  themeData = {};
  imageData = {};
  serverData = { urlUploadAllowed: true, enterprise: false };
}

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isCrispEnabled() {
    return true;
  }
}

module('Integration | Component | top-nav', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

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
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:configuration', ConfigurationStub);

    const organization = this.owner.lookup('service:organization');

    this.setProperties({
      title: t('vapt'),
      organization: organization,
      user: store.createRecord('user', this.server.create('user').toJSON()),
    });

    // handle submissions api for each test
    this.server.get('/submissions', () => []);
  });

  test('it renders main top-nav with title', async function (assert) {
    await render(hbs`
      <TopNav 
        @user={{this.user}} 
        @title={{this.title}}
      />
    `);

    assert.dom('[data-test-topNav]').exists();

    assert.dom('[data-test-topNav-title]').hasText(this.title);

    assert.dom('[data-test-bell-icon]').isNotDisabled();

    assert
      .dom('[data-test-topNav-profileBtn]')
      .isNotDisabled()
      .hasText(this.user.username);
  });

  test('it renders main top-nav without title', async function (assert) {
    await render(hbs`
      <TopNav 
        @user={{this.user}} 
      />
    `);

    assert.dom('[data-test-topNav]').exists();

    assert.dom('[data-test-topNav-logo]').exists();

    assert.dom('[data-test-bell-icon]').isNotDisabled();

    assert
      .dom('[data-test-topNav-profileBtn]')
      .isNotDisabled()
      .hasText(this.user.username);
  });

  test.each(
    'test profile btn menu items',
    [{ chatSupport: true }, { chatSupport: false }],
    async function (assert, { chatSupport }) {
      await render(hbs`
        <TopNav 
          @user={{this.user}} 
          @title={{this.title}}
        />
      `);

      const freshdesk = this.owner.lookup('service:freshdesk');
      freshdesk.freshchatEnabled = chatSupport;
      freshdesk.logUserOutOfSupportWidget = () => {};

      assert.dom('[data-test-topNav]').exists();

      assert
        .dom('[data-test-topNav-profileBtn]')
        .isNotDisabled()
        .hasText(this.user.username);

      await click('[data-test-topNav-profileBtn]');

      assert.dom('[data-test-topNav-profileMenuItem]').exists();

      const menuItems = findAll('[data-test-topNav-profileMenuItem]');

      assert.dom(menuItems[0]).hasText(this.user.username);
      assert.dom(menuItems[1]).hasText(this.user.email);

      if (chatSupport) {
        assert.dom(menuItems[2]).hasText(t('support'));
        assert.dom(menuItems[3]).hasText(t('logout'));
      } else {
        assert.dom(menuItems[2]).hasText(t('logout'));
      }
    }
  );
});
