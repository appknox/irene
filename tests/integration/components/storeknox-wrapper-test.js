import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
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

const storeknoxMenuItems = [
  {
    label: () => t('inventory'),
    icon: 'inventory-2',
  },
  {
    label: () => t('discovery'),
    icon: 'search',
  },
].filter(Boolean);

module('Integration | Component | storeknox-wrapper', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');
  setupBrowserFakes(hooks, { window: true, localStorage: true });

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

    const window = this.owner.lookup('service:browser/window');

    window.localStorage.setItem('sidebarState', 'expanded');

    this.setProperties({
      title: t('storeknox.title'),
      organization: organization,
      user: store.createRecord('user', this.server.create('user').toJSON()),
    });

    // handle submissions api for each test
    this.server.get('/submissions', () => []);
  });

  test('it renders main top-nav with title', async function (assert) {
    await render(hbs`
      <StoreknoxWrapper 
        @user={{this.user}} 
      />
    `);

    assert.dom('[data-test-topNav]').exists();

    // assert.dom('[data-test-topNav-title]').hasText(this.title);

    assert.dom('[data-test-bell-icon]').isNotDisabled();

    assert
      .dom('[data-test-topNav-profileBtn]')
      .isNotDisabled()
      .hasText(this.user.username);
  });

  test('it should render storeknox side nav', async function (assert) {
    await render(hbs`
      <StoreknoxWrapper 
        @user={{this.user}} 
      />
    `);

    const menuItemEle = findAll('[data-test-side-menu-item]');

    storeknoxMenuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-menu-item-icon]', menuItemEle[index])
        .hasClass(`ak-icon-${it.icon}`);
    });

    assert.dom('[data-test-side-lower-menu]').exists();

    assert.dom('[data-test-side-lower-menu-divider]').exists();

    storeknoxMenuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-menu-item-text]', menuItemEle[index])
        .hasText(it.label());
    });

    assert
      .dom('[data-test-side-lower-menu-item-text]')
      .containsText(t('collapse'));

    assert
      .dom('[data-test-side-lower-menu-item-icon]')
      .hasClass('ak-icon-keyboard-tab');

    const collapseButton = find(
      `[data-test-side-lower-menu-item="${t('collapse')}"]`
    );

    assert.ok(collapseButton, 'Collapse button should exist');

    await click(collapseButton);

    assert.dom('[data-test-side-lower-menu-item-text]').doesNotExist();

    assert
      .dom('[data-test-side-lower-menu-item-icon]')
      .hasClass('ak-icon-keyboard-tab');
  });
});
