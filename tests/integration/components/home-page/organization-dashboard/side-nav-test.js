import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
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

const menuItems = ({
  analytics,
  appMonitoring,
  market,
  billing,
  partner,
  security,
  sbom,
}) =>
  [
    { label: 't:allProjects:()', icon: 'folder', hasBadge: true },
    appMonitoring && { label: 't:appMonitoring:()', icon: 'inventory-2' },
    sbom && { label: 't:SBOM:()', icon: 'receipt-long' },
    analytics && { label: 't:analytics:()', icon: 'graphic-eq' },
    { label: 't:organization:()', icon: 'people' },
    { label: 't:accountSettings:()', icon: 'account-box' },
    market && { label: 't:marketplace:()', icon: 'account-balance' },
    billing && { label: 't:billing:()', icon: 'credit-card' },
    partner && {
      label: 't:clients:()',
      icon: 'groups-2',
      hasBadge: true,
      badgeLabel: 't:beta:()',
    },
    security && { label: 't:securityDashboard:()', icon: 'security' },
  ].filter(Boolean);

const sections = (enabled) => ({
  billing: enabled,
  appMonitoring: enabled,
  market: enabled,
  partner: enabled,
  security: enabled,
  sbom: enabled,
});

const lowerMenuItems = [
  {
    title: 't:chatSupport:()',
    icon: 'chat-bubble',
  },
  {
    title: 't:version:()',
    icon: 'info',
    enablePendo: false,
    divider: true,
  },
  {
    title: 't:collapse:()',
    icon: 'keyboard-tab',
  },
];

module(
  'Integration | Component | home-page/organization-dashboard/side-nav',
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
      this.owner.register('service:integration', IntegrationStub);
      this.owner.register('service:notifications', NotificationsStub);

      const organization = this.owner.lookup('service:organization');

      this.setProperties({
        organization: organization,
      });
    });

    test.each(
      'it should render org-side-menu',
      [
        { owner: true, admin: true, ...sections(true) },
        { owner: true, admin: true, ...sections(false) },
        { owner: false, admin: true, ...sections(true) },
        { owner: false, admin: true, ...sections(false) },
        { owner: false, admin: false, ...sections(true) },
        { owner: false, admin: false, ...sections(false) },
      ],
      async function (
        assert,
        {
          owner,
          admin,
          billing,
          partner,
          market,
          appMonitoring,
          security,
          sbom,
        }
      ) {
        this.setProperties({
          isSecurityEnabled: security,
          isCollapsed: false,
          toggleSidebar: () => {
            this.isCollapsed = !this.isCollapsed;
          },
        });

        const me = this.owner.lookup('service:me');

        me.org.is_owner = owner;
        me.org.is_admin = admin;
        me.org.can_access_partner_dashboard = partner;

        ENV.enableMarketplace = market;

        this.organization.selected.billingHidden = !billing;

        this.organization.selected.features = {
          app_monitoring: appMonitoring,
          sbom,
        };

        await render(
          hbs`<HomePage::OrganizationDashboard::SideNav @isSecurityEnabled={{this.isSecurityEnabled}} @isCollapsed={{this.isCollapsed}} @toggleSidebar={{this.toggleSidebar}} />`
        );

        assert.dom('[data-test-img-logo]').exists();

        const menuItemEle = findAll('[data-test-side-menu-item]');

        menuItems({
          analytics: owner || admin,
          billing: owner && billing,
          market,
          appMonitoring,
          partner,
          security,
          sbom,
        }).forEach((it, index) => {
          assert
            .dom('[data-test-side-menu-item-icon]', menuItemEle[index])
            .hasClass(`ak-icon-${it.icon}`);

          assert
            .dom('[data-test-side-menu-item-text]', menuItemEle[index])
            .hasText(it.label);

          if (it.hasBadge) {
            assert
              .dom('[data-test-side-menu-item-badge]', menuItemEle[index])
              .exists()
              .hasText(
                it.badgeLabel ||
                  String(this.organization.selected.projectsCount)
              );
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
      async function (
        assert,
        {
          owner,
          admin,
          billing,
          partner,
          market,
          appMonitoring,
          security,
          sbom,
        }
      ) {
        this.setProperties({
          isCollapsed: true,
          isSecurityEnabled: security,
          toggleSidebar: () => {
            this.isCollapsed = !this.isCollapsed;
          },
        });

        const me = this.owner.lookup('service:me');

        me.org.is_owner = owner;
        me.org.is_admin = admin;
        me.org.can_access_partner_dashboard = partner;

        ENV.enableMarketplace = market;

        this.organization.selected.billingHidden = !billing;

        this.organization.selected.features = {
          app_monitoring: appMonitoring,
          sbom,
        };

        await render(
          hbs`<HomePage::OrganizationDashboard::SideNav @isSecurityEnabled={{this.isSecurityEnabled}} @isCollapsed={{this.isCollapsed}} @toggleSidebar={{this.toggleSidebar}} />`
        );

        const menuItemEle = findAll('[data-test-side-menu-item]');

        menuItems({
          analytics: owner || admin,
          billing: owner && billing,
          market,
          appMonitoring,
          partner,
          security,
          sbom,
        }).forEach((it, index) => {
          assert
            .dom('[data-test-side-menu-item-icon]', menuItemEle[index])
            .hasClass(`ak-icon-${it.icon}`);
        });
      }
    );

    test('it should hide sbom link in side menu if org is an enterprise', async function (assert) {
      this.owner.register('service:configuration', ConfigurationStub);

      this.setProperties({
        isCollapsed: false,
        toggleSidebar: () => {
          this.isCollapsed = !this.isCollapsed;
        },
      });

      await render(
        hbs`<HomePage::OrganizationDashboard::SideNav @isCollapsed={{this.isCollapsed}} @toggleSidebar={{this.toggleSidebar}}  />`
      );

      assert.dom(`[data-test-side-menu-item='t:SBOM:()']`).doesNotExist();
    });

    test('it should show lower menu items', async function (assert) {
      this.setProperties({
        isCollapsed: false,
        toggleSidebar: () => {
          this.set('isCollapsed', !this.isCollapsed);
        },
      });

      await render(
        hbs`<HomePage::OrganizationDashboard::SideNav @isCollapsed={{this.isCollapsed}} @toggleSidebar={{this.toggleSidebar}}  />`
      );

      assert.dom('[data-test-side-lower-menu]').exists();

      assert.dom('[data-test-side-lower-menu-divider]').exists();

      const lowerMenuItemEle = findAll('[data-test-side-lower-menu-item]');

      const collapseButton = find(`[
        data-test-side-lower-menu-item='t:collapse:()'
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
        data-test-side-lower-menu-item='t:expand:()'
      ]`);

      await click(expandButton);

      assert.notOk(
        this.isCollapsed,
        'Sidebar should be expanded after clicking the expand button'
      );

      lowerMenuItems.forEach((it, index) => {
        assert
          .dom('[data-test-side-lower-menu-item-text]', lowerMenuItemEle[index])
          .containsText(it.title);

        assert
          .dom('[data-test-side-lower-menu-item-icon]', lowerMenuItemEle[index])
          .hasClass(`ak-icon-${it.icon}`);
      });
    });
  }
);
