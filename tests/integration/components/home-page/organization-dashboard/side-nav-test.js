import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
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
    { label: 't:projects:()', icon: 'folder', hasBadge: true },
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
      this.owner.register('service:notifications', NotificationsStub);

      const organization = this.owner.lookup('service:organization');

      this.setProperties({
        organization: organization,
      });

      // TODO: remove this
      this.server.get('/submissions', () => {
        return [];
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
          hbs`<HomePage::OrganizationDashboard::SideNav @isSecurityEnabled={{this.isSecurityEnabled}} />`
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

    test('it should hide sbom link in side menu if org is an enterprise', async function (assert) {
      this.owner.register('service:configuration', ConfigurationStub);

      await render(hbs`<HomePage::OrganizationDashboard::SideNav />`);

      assert.dom(`[data-test-side-menu='t:SBOM:()']`).doesNotExist();
    });
  }
);
