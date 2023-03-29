import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'irene/config/environment';
import styles from './index.scss';

import MeService from 'irene/services/me';
import OrganizationService from 'irene/services/organization';
import IntegrationService from 'irene/services/integration';
import IntlService from 'ember-intl/services/intl';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  query?: Record<string, string | number>;
  currentWhen?: string;
  hasBadge?: boolean;
  isBeta?: boolean;
}

export default class HomePageSideMenuComponent extends Component {
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service declare integration: IntegrationService;
  @service declare intl: IntlService;

  showMarketplace = ENV.enableMarketplace;
  productVersion = ENV.productVersion;

  get classes() {
    return {
      menuItemText: styles['menu-item-text'],
      menuItemLink: styles['menu-item-link'],
      menuItemLinkActive: styles['active'],
    };
  }

  get menuItems() {
    return [
      {
        label: this.intl.t('projects'),
        icon: 'folder',
        route: 'authenticated.projects',
        hasBadge: true,
      },
      this.showAppMonitoringDashboard && {
        label: this.intl.t('appMonitoring'),
        icon: 'inventory-2',
        route: 'authenticated.dashboard.app-monitoring',
        query: { app_offset: 0 },
        currentWhen: 'authenticated.dashboard.app-monitoring',
      },
      this.isShowAnalytics && {
        label: this.intl.t('analytics'),
        icon: 'graphic-eq',
        route: 'authenticated.analytics',
      },
      {
        label: this.intl.t('organization'),
        icon: 'people',
        route: 'authenticated.organization.namespaces',
      },
      {
        label: this.intl.t('accountSettings'),
        icon: 'account-box',
        route: 'authenticated.settings',
      },
      this.showMarketplace && {
        label: this.intl.t('marketplace'),
        icon: 'account-balance',
        route: 'authenticated.marketplace',
      },
      this.showBilling && {
        label: this.intl.t('billing'),
        icon: 'credit-card',
        route: 'authenticated.billing',
      },
      this.showPartnerDashboard && {
        label: this.intl.t('clients'),
        icon: 'groups-2',
        route: 'authenticated.partner.clients',
        hasBadge: true,
        isBeta: true,
      },
    ].filter(Boolean) as MenuItem[];
  }

  /**
   * @property {Boolean} isShowAnalytics
   * Property to disable analytics page for member role
   */
  get isShowAnalytics() {
    return this.me.org?.is_member === false;
  }

  get showBilling() {
    const orgShowBilling = this.organization?.selected?.showBilling;
    const isOwner = this.me.org?.is_owner;

    return orgShowBilling && isOwner;
  }

  get showPartnerDashboard() {
    return this.me.org?.can_access_partner_dashboard;
  }

  get showAppMonitoringDashboard() {
    return this.organization?.selected?.features?.app_monitoring;
  }

  get enablePendo() {
    return this.integration.isPendoEnabled();
  }
}
