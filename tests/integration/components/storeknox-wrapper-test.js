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
  freshchatEnabled = true;
}

class ConfigurationStub extends Service {
  frontendData = {};
  themeData = {};
  imageData = {};
  serverData = { enterprise: false };
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
];

const lowerMenuItems = [
  {
    title: () => t('chatSupport'),
    icon: 'chat-bubble',
    enabled: false,
  },
  {
    title: () => t('version'),
    icon: 'info',
    enabled: false,
  },
  {
    title: () => t('collapse'),
    icon: 'keyboard-tab',
  },
];

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
    const guideCategories = [
      {
        category: t('storeknox.title'),
        guides: [
          {
            id: 'accessing-storeknox',
            title: t('storeknox.accessingStoreknox'),
          },
          {
            id: 'using-inventory',
            title: t('storeknox.usingInventory'),
          },
          {
            id: 'discovering-apps',
            title: t('storeknox.discoveringApps'),
          },
          {
            id: 'reviewing-apps',
            title: t('storeknox.reviewingAppRequests'),
          },
        ],
      },
    ];

    await render(hbs`
      <StoreknoxWrapper
        @user={{this.user}}
      />
    `);

    assert.dom('[data-test-topNav]').exists();

    // assert.dom('[data-test-topNav-title]').hasText(this.title);

    assert.dom('[data-test-bell-icon]').exists();

    assert
      .dom('[data-test-topNav-profileBtn]')
      .isNotDisabled()
      .hasText(this.user.username);

    assert.dom('[data-test-topNav-OnboardingGuideBtn]').exists();

    await click('[data-test-topNav-OnboardingGuideBtn]');

    assert
      .dom('[data-test-onboarding-guide-modal]')
      .exists()
      .containsText(t('onboardingGuides'));

    guideCategories.forEach((gCat) => {
      const category = find(
        `[data-test-onboarding-guide-category='${gCat.category}']`
      );

      assert.dom(category).hasText(gCat.category);

      gCat.guides.forEach((guide) => {
        const guideElem = find(
          `[data-test-onboarding-guide-list-item='${guide.id}']`
        );

        assert.dom(guideElem).hasText(guide.title);
      });
    });

    const defaultSelectedGuide = guideCategories[0].guides[0];

    assert
      .dom(`[data-test-onboarding-guide-iframe='${defaultSelectedGuide.id}']`)
      .exists();
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
        .hasAttribute('icon', `material-symbols:${it.icon}`);
    });

    assert.dom('[data-test-side-lower-menu]').exists();

    assert.dom('[data-test-side-lower-menu-divider]').exists();

    storeknoxMenuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-menu-item-text]', menuItemEle[index])
        .hasText(it.label());
    });

    let lowerMenuItemEle = findAll('[data-test-side-lower-menu-item]');

    lowerMenuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-lower-menu-item-text]', lowerMenuItemEle[index])
        .containsText(it.title());

      assert
        .dom('[data-test-side-lower-menu-item-icon]', lowerMenuItemEle[index])
        .hasAttribute('icon', `material-symbols:${it.icon}`);
    });

    const collapseButton = find(
      `[data-test-side-lower-menu-item="${t('collapse')}"]`
    );

    assert.ok(collapseButton, 'Collapse button should exist');

    await click(collapseButton);

    lowerMenuItemEle = findAll('[data-test-side-lower-menu-item]');

    lowerMenuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-lower-menu-item-text]', lowerMenuItemEle[index])
        .doesNotExist();

      assert
        .dom('[data-test-side-lower-menu-item-icon]', lowerMenuItemEle[index])
        .hasAttribute('icon', `material-symbols:${it.icon}`);
    });
  });
});
