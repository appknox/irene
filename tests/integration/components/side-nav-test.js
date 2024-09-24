import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import ENV from 'irene/config/environment';

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

class ConfigurationStub extends Service {
  frontendData = {};
  themeData = {};
  imageData = {};
  serverData = {
    enterprise: true,
  };
}

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return true;
  }
}

class FreshdeskStub extends Service {
  freshchatEnabled = true;
}

const menuItems = ({
  analytics,
  appMonitoring,
  publicApis,
  market,
  billing,
  partner,
  security,
  sbom,
}) =>
  [
    {
      label: t('allProjects'),
      icon: 'folder',
      hasBadge: true,
      badgeLabel: '108',
    },
    appMonitoring && { label: t('appMonitoring'), icon: 'inventory-2' },
    sbom && { label: t('SBOM'), icon: 'receipt-long' },
    analytics && { label: t('analytics'), icon: 'graphic-eq' },
    { label: t('organization'), icon: 'people' },
    publicApis && { label: t('apiDocumentation') },
    market && { label: t('marketplace'), icon: 'account-balance' },
    { label: t('accountSettings'), icon: 'account-box' },
    billing && { label: t('billing'), icon: 'credit-card' },
    partner && {
      label: t('clients'),
      icon: 'groups-2',
      hasBadge: true,
      badgeLabel: t('beta'),
    },
    security && { label: t('securityDashboard'), icon: 'security' },
  ].filter(Boolean);

const sections = (enabled) => ({
  billing: enabled,
  appMonitoring: enabled,
  market: enabled,
  partner: enabled,
  security: enabled,
  sbom: enabled,
  publicApis: enabled,
});

const storeknoxMenuItems = [
  {
    label: () => t('discovery'),
    icon: 'search',
  },
  {
    label: () => t('inventory'),
    icon: 'inventory-2',
  },
].filter(Boolean);

const lowerMenuItems = [
  {
    title: () => t('chatSupport'),
    icon: 'chat-bubble',
    onClick: () => {},
  },
  {
    title: () => t('version'),
    icon: 'info',
    enablePendo: false,
    divider: true,
    onClick: () => {},
  },
  {
    title: () => t('collapse'),
    icon: 'keyboard-tab',
    onClick: () => {},
  },
];

module('Integration | Component | side-nav', function (hooks) {
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
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:notifications', NotificationsStub);

    const organization = this.owner.lookup('service:organization');

    this.setProperties({
      organization: organization,
    });
  });

  test.each(
    'it should render appknox side nav',
    [
      { owner: true, admin: true, ...sections(true) },
      { owner: true, admin: true, ...sections(false) },
      { owner: false, admin: true, ...sections(true) },
      { owner: false, admin: true, ...sections(false) },
      { owner: false, admin: false, ...sections(true) },
      { owner: false, admin: false, ...sections(false) },
    ],
    async function (assert, scenario) {
      const { owner, admin, ...sectionConfig } = scenario;
      const me = this.owner.lookup('service:me');

      // Set up dynamic properties based on the scenario
      this.setProperties({
        isCollapsed: false,
        toggleSidebar: () => {},
        isSecurityEnabled: sectionConfig.security,
        menuItems: menuItems(sectionConfig), // Compute `menuItems` based on `sectionConfig`
        lowerMenuItems, // Pass the lowerMenuItems if applicable
      });

      me.org.is_owner = owner;
      me.org.is_admin = admin;
      me.org.can_access_partner_dashboard = sectionConfig.partner;

      ENV.enableMarketplace = sectionConfig.market;

      this.organization.selected.billingHidden = !sectionConfig.billing;

      this.organization.selected.features = {
        app_monitoring: sectionConfig.appMonitoring,
        public_apis: sectionConfig.publicApis,
        sbom: sectionConfig.sbom,
      };

      await render(
        hbs`<SideNav @isSecurityEnabled={{this.isSecurityEnabled}} @isCollapsed={{this.isCollapsed}} @toggleSidebar={{this.toggleSidebar}} @menuItems={{this.menuItems}} @lowerMenuItems={{this.lowerMenuItems}} />`
      );

      assert.dom('[data-test-img-logo]').exists();

      const menuItemEle = findAll('[data-test-side-menu-item]');

      this.menuItems.forEach((it, index) => {
        if (it.icon) {
          assert
            .dom('[data-test-side-menu-item-icon]', menuItemEle[index])
            .hasClass(`ak-icon-${it.icon}`);
        }

        assert
          .dom('[data-test-side-menu-item-text]', menuItemEle[index])
          .hasText(it.label);

        if (it.hasBadge) {
          assert
            .dom('[data-test-side-menu-item-badge]', menuItemEle[index])
            .exists()
            .hasText(it.badgeLabel);
        }
      });
    }
  );

  test.each(
    'it should show collapsed menu if isCollapsed is false',
    [
      { owner: true, admin: true, ...sections(true) },
      { owner: true, admin: true, ...sections(false) },
      { owner: false, admin: true, ...sections(true) },
      { owner: false, admin: true, ...sections(false) },
      { owner: false, admin: false, ...sections(true) },
      { owner: false, admin: false, ...sections(false) },
    ],
    async function (assert, scenario) {
      const { owner, admin, ...sectionConfig } = scenario;
      const me = this.owner.lookup('service:me');

      // Set up dynamic properties based on the scenario
      this.setProperties({
        isCollapsed: false,
        toggleSidebar: () => {},
        isSecurityEnabled: sectionConfig.security,
        menuItems: menuItems(sectionConfig), // Compute `menuItems` based on `sectionConfig`
        lowerMenuItems, // Pass the lowerMenuItems if applicable
      });

      me.org.is_owner = owner;
      me.org.is_admin = admin;
      me.org.can_access_partner_dashboard = sectionConfig.partner;

      ENV.enableMarketplace = sectionConfig.market;

      this.organization.selected.billingHidden = !sectionConfig.billing;

      this.organization.selected.features = {
        app_monitoring: sectionConfig.appMonitoring,
        sbom: sectionConfig.sbom,
      };

      await render(
        hbs`<SideNav @isSecurityEnabled={{this.isSecurityEnabled}} @isCollapsed={{this.isCollapsed}} @toggleSidebar={{this.toggleSidebar}} @menuItems={{this.menuItems}} @lowerMenuItems={{this.lowerMenuItems}}/>`
      );

      const menuItemEle = findAll('[data-test-side-menu-item]');

      this.menuItems.forEach((it, index) => {
        if (it.icon) {
          assert
            .dom('[data-test-side-menu-item-icon]', menuItemEle[index])
            .hasClass(`ak-icon-${it.icon}`);
        }
      });
    }
  );

  test('it should hide sbom link in side menu if org is an enterprise', async function (assert) {
    this.owner.register('service:configuration', ConfigurationStub);

    this.setProperties({
      isCollapsed: false,
      menuItems: menuItems({
        analytics: true,
        appMonitoring: true,
        sbom: false,
      }),
      lowerMenuItems: lowerMenuItems,
      toggleSidebar: () => {
        this.isCollapsed = !this.isCollapsed;
      },
    });

    await render(
      hbs`<SideNav @isCollapsed={{this.isCollapsed}} @toggleSidebar={{this.toggleSidebar}} @menuItems={{this.menuItems}} @lowerMenuItems={{this.lowerMenuItems}} />`
    );

    assert.dom(`[data-test-side-menu-item="${t('SBOM')}"]`).doesNotExist();
  });

  test('it should show lower menu items', async function (assert) {
    this.owner.register('service:freshdesk', FreshdeskStub);

    this.setProperties({
      isCollapsed: false,
      toggleSidebar: () => {
        this.isCollapsed = !this.isCollapsed;
      },
      menuItems: menuItems({
        analytics: true,
        appMonitoring: true,
        sbom: true,
      }),
      lowerMenuItems: lowerMenuItems,
    });

    this.setProperties({
      isCollapsed: false,
      toggleSidebar: () => {
        this.set('isCollapsed', !this.isCollapsed);
      },
    });

    await render(
      hbs`<SideNav @isCollapsed={{this.isCollapsed}} @toggleSidebar={{this.toggleSidebar}} @menuItems={{this.menuItems}} @lowerMenuItems={{this.lowerMenuItems}}  />`
    );

    assert.dom('[data-test-side-lower-menu]').exists();

    assert.dom('[data-test-side-lower-menu-divider]').exists();

    const lowerMenuItemEle = findAll('[data-test-side-lower-menu-item]');

    const collapseButton = find(`[
        data-test-side-lower-menu-item="${t('collapse')}"
      ]`);

    assert.ok(collapseButton, 'Collapse button should exist');

    await click(collapseButton);

    assert.ok(
      this.isCollapsed,
      'Sidebar should be collapsed after clicking the expand button'
    );

    assert.dom('[data-test-side-lower-menu-item-text]').doesNotExist();

    lowerMenuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-lower-menu-item-icon]', lowerMenuItemEle[index])
        .hasClass(`ak-icon-${it.icon}`);
    });

    const expandButton = find(`[
        data-test-side-lower-menu-item="${t('expand')}"
      ]`);

    await click(expandButton);

    assert.notOk(
      this.isCollapsed,
      'Sidebar should be expanded after clicking the expand button'
    );

    lowerMenuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-lower-menu-item-text]', lowerMenuItemEle[index])
        .containsText(it.title());

      assert
        .dom('[data-test-side-lower-menu-item-icon]', lowerMenuItemEle[index])
        .hasClass(`ak-icon-${it.icon}`);
    });
  });

  test('it should render storeknox side nav', async function (assert) {
    this.setProperties({
      isCollapsed: false,
      toggleSidebar: () => {
        this.set('isCollapsed', !this.isCollapsed);
      },
      menuItems: storeknoxMenuItems,
    });

    await render(
      hbs`<SideNav @isCollapsed={{this.isCollapsed}} @toggleSidebar={{this.toggleSidebar}} @menuItems={{this.menuItems}}  />`
    );

    const menuItemEle = findAll('[data-test-side-menu-item]');

    this.menuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-menu-item-icon]', menuItemEle[index])
        .hasClass(`ak-icon-${it.icon}`);
    });

    assert.dom('[data-test-side-lower-menu]').exists();

    assert.dom('[data-test-side-lower-menu-divider]').exists();

    const collapseButton = find(
      `[data-test-side-lower-menu-item="${t('collapse')}"]`
    );

    assert.ok(collapseButton, 'Collapse button should exist');

    await click(collapseButton);

    assert.ok(
      this.isCollapsed,
      'Sidebar should be collapsed after clicking the expand button'
    );

    assert.dom('[data-test-side-lower-menu-item-text]').doesNotExist();

    assert
      .dom('[data-test-side-lower-menu-item-icon]')
      .hasClass('ak-icon-keyboard-tab');

    const expandButton = find(
      `[data-test-side-lower-menu-item="${t('expand')}"]`
    );

    await click(expandButton);

    assert.notOk(
      this.isCollapsed,
      'Sidebar should be expanded after clicking the expand button'
    );

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
  });

  test.each(
    'it should render switcher modal',
    [true, false],
    async function (assert, storeknox) {
      this.setProperties({
        isCollapsed: false,
        toggleSidebar: () => {
          this.set('isCollapsed', !this.isCollapsed);
        },
        menuItems: menuItems({
          analytics: true,
          sbom: true,
          appMonitoring: storeknox,
        }),
      });

      this.organization.selected.features = {
        app_monitoring: storeknox,
      };

      await render(
        hbs`<SideNav @isCollapsed={{this.isCollapsed}} @toggleSidebar={{this.toggleSidebar}} @menuItems={{this.menuItems}} />`
      );

      if (storeknox) {
        assert.dom('[data-test-side-menu-switcher]').exists();

        assert.dom('[data-test-side-menu-switcher-modal]').doesNotExist();

        assert.dom('[data-test-side-menu-switcher-icon]').exists();

        assert
          .dom('[data-test-side-menu-switcher-text]')
          .exists()
          .hasText(t('appSwitcher'));

        await click('[data-test-side-menu-switcher]');

        assert.dom('[data-test-side-menu-switcher-modal]').exists();
      } else {
        assert.dom('[data-test-side-menu-switcher]').doesNotExist();
      }
    }
  );
});
