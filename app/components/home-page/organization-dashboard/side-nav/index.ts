import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'irene/config/environment';
import styles from './index.scss';

import MeService from 'irene/services/me';
import OrganizationService from 'irene/services/organization';
import IntegrationService from 'irene/services/integration';
import IntlService from 'ember-intl/services/intl';
import ConfigurationService from 'irene/services/configuration';
import WhitelabelService from 'irene/services/whitelabel';
import { action } from '@ember/object';
import * as chat from 'irene/utils/chat';

export interface HomePageOrganizationDashboardSideNavSignature {
  Args: {
    isSecurityEnabled?: boolean;
    isCollapsed: boolean;
    toggleSidebar: () => void;
  };
  Element: HTMLElement;
}

interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  query?: Record<string, string | number>;
  currentWhen?: string;
  hasBadge?: boolean;
  badgeLabel?: string;
  component?: 'home-page/organization-dashboard/side-nav/security-menu-item';
}

interface LowerMenuItem {
  title: string;
  icon?: string;
  divider?: boolean;
  onClick: () => void;
  enablePendo?: boolean;
  iconClass?: string;
  textClass?: string;
  listItemClass?: string;
}

export default class HomePageOrganizationDashboardSideNavComponent extends Component<HomePageOrganizationDashboardSideNavSignature> {
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service declare integration: IntegrationService;
  @service declare intl: IntlService;
  @service declare configuration: ConfigurationService;
  @service declare whitelabel: WhitelabelService;
  @service('browser/window') declare window: Window;

  showMarketplace = ENV.enableMarketplace;
  productVersion = ENV.productVersion;

  get classes() {
    return {
      menuItemText: styles['menu-item-text'],
      menuItemLink: styles['menu-item-link'],
      menuItemLinkActive: styles['active'],
      menuItemTooltip: styles['menu-item-tooltip'],
    };
  }

  get menuItems() {
    return [
      {
        label: this.intl.t('allProjects'),
        icon: 'folder',
        route: 'authenticated.projects',
        hasBadge: true,
        badgeLabel: this.organization.selected?.projectsCount,
        currentWhen:
          'authenticated.projects authenticated.project.files authenticated.project.settings authenticated.dashboard.compare authenticated.file authenticated.dashboard.file-vul-compare authenticated.choose authenticated.dashboard.file',
      },
      this.showAppMonitoringDashboard && {
        label: this.intl.t('appMonitoring'),
        icon: 'inventory-2',
        route: 'authenticated.dashboard.app-monitoring',
        query: { app_offset: 0 },
        currentWhen: 'authenticated.dashboard.app-monitoring',
      },
      this.showSbomDashboard && {
        label: this.intl.t('SBOM'),
        icon: 'receipt-long',
        route: 'authenticated.dashboard.sbom.apps',
        query: { app_offset: 0 },
        currentWhen:
          'authenticated.dashboard.sbom.apps authenticated.dashboard.sbom.app-scans authenticated.dashboard.sbom.scan-details',
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
        currentWhen:
          'authenticated.organization.namespaces authenticated.organization.users authenticated.organization.teams authenticated.organization-settings',
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
        badgeLabel: this.intl.t('beta'),
      },
      this.args.isSecurityEnabled && {
        label: this.intl.t('security'),
        component:
          'home-page/organization-dashboard/side-nav/security-menu-item' as const,
      },
    ].filter(Boolean) as MenuItem[];
  }

  get lowerMenuItems() {
    return [
      {
        title: this.intl.t('chatSupport'),
        icon: 'chat-bubble',
        onClick: this.openChatBox,
        iconClass: 'lower-menu-chat',
        textClass: styles['lower-menu-chat'],
      },
      {
        title: this.versionText,
        icon: this.enablePendo ? null : 'info',
        enablePendo: this.enablePendo,
        onClick: this.showGuide,
        divider: true,
        textClass: styles['menu-item-text'],
        listItemClass: this.enablePendo ? '' : 'no-hover',
      },
      {
        title: this.args.isCollapsed
          ? this.intl.t('expand')
          : this.intl.t('collapse'),
        icon: 'keyboard-tab',
        onClick: this.args.toggleSidebar,
        textClass: styles['menu-item-text'],
        iconClass: this.isSidebarExpanded ? 'rotated-icon' : '',
      },
    ].filter(Boolean) as LowerMenuItem[];
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

  get showSbomDashboard() {
    return (
      this.organization.selected?.features?.sbom &&
      !this.configuration.serverData.enterprise
    );
  }

  get enablePendo() {
    return this.integration.isPendoEnabled();
  }

  get isSidebarExpanded() {
    return !this.args.isCollapsed;
  }

  get versionText() {
    const version = this.productVersion;
    const translated = this.intl.t('version');
    return `${translated} - ${version}`;
  }

  @action async showGuide() {
    if (this.enablePendo) {
      try {
        const guide = this.window.pendo
          .getActiveGuides()
          .find(function (element) {
            return element.launchMethod === 'auto-badge';
          });

        await guide?.show();
      } catch (e) {
        console.error(e);
      }
    }
  }

  @action openChatBox() {
    chat.openChatBox();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'HomePage::OrganizationDashboard::SideNav': typeof HomePageOrganizationDashboardSideNavComponent;
  }
}
