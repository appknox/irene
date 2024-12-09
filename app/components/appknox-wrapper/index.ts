import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENV from 'irene/config/environment';
import type UserModel from 'irene/models/user';
import type MeService from 'irene/services/me';
import type FreshdeskService from 'irene/services/freshdesk';
import type IntegrationService from 'irene/services/integration';
import type OrganizationService from 'irene/services/organization';
import type ConfigurationService from 'irene/services/configuration';
import type { LowerMenuItem, MenuItem } from '../side-nav';
import styles from './index.scss';

export interface AppknoxWrapperSignature {
  Args: {
    user: UserModel;
  };

  Blocks: {
    default: [];
  };
}

export default class AppknoxWrapperComponent extends Component<AppknoxWrapperSignature> {
  @service declare ajax: any;
  @service declare session: any;
  @service declare me: MeService;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare freshdesk: FreshdeskService;
  @service declare integration: IntegrationService;
  @service declare organization: OrganizationService;
  @service declare notifications: NotificationService;
  @service declare configuration: ConfigurationService;
  @service('browser/window') declare window: Window;

  @tracked isEmptyOrgName = this.checkIfOrgNameIsEmpty;
  @tracked showAddEditModal = this.isEmptyOrgName;
  @tracked showOnboardingGuide = false;
  @tracked isSidebarCollapsed: boolean;

  showMarketplace = ENV.enableMarketplace;
  productVersion = ENV.productVersion;

  constructor(owner: unknown, args: AppknoxWrapperSignature['Args']) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem('sidebarState');
    this.isSidebarCollapsed =
      storedState !== null ? storedState === 'collapsed' : true;
  }

  get checkIfOrgNameIsEmpty() {
    const organization = this.organization;
    const isOwner = this.me?.org?.get('is_owner');

    if (isOwner) {
      const orgName = organization?.selected?.name;

      if (!orgName) {
        return true;
      }
    }

    return false;
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

  get showPublicApiDocs() {
    return this.organization?.selected?.features?.public_apis;
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

  get enableChatSupport() {
    return this.freshdesk.freshchatEnabled;
  }

  get versionText() {
    const version = this.productVersion;
    const translated = this.intl.t('version');
    return `${translated} - ${version}`;
  }

  get menuItems() {
    return [
      {
        label: this.intl.t('allProjects'),
        icon: 'folder',
        route: 'authenticated.dashboard.projects',
        hasBadge: true,
        badgeLabel: this.organization.selected?.projectsCount,
        currentWhen:
          'authenticated.dashboard.projects authenticated.dashboard.project.files authenticated.dashboard.project.settings authenticated.dashboard.compare authenticated.dashboard.file authenticated.dashboard.file-vul-compare authenticated.dashboard.choose authenticated.dashboard.file',
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
        route: 'authenticated.dashboard.analytics',
      },
      {
        label: this.intl.t('organization'),
        icon: 'people',
        route: 'authenticated.dashboard.organization.namespaces',
        currentWhen:
          'authenticated.dashboard.organization.namespaces authenticated.dashboard.organization.users authenticated.dashboard.organization.teams authenticated.dashboard.organization-settings',
      },
      this.showPublicApiDocs && {
        label: this.intl.t('apiDocumentation'),
        route: 'authenticated.dashboard.public-api.docs',
        currentWhen: 'authenticated.dashboard.public-api.docs',
        customIconComponent: 'ak-svg/public-api-icon' as const,
      },
      {
        label: this.intl.t('accountSettings'),
        icon: 'account-box',
        route: 'authenticated.dashboard.account-settings.general',
        currentWhen:
          'authenticated.dashboard.account-settings.general authenticated.dashboard.account-settings.security authenticated.dashboard.account-settings.developersettings',
      },
      this.showMarketplace && {
        label: this.intl.t('marketplace'),
        icon: 'account-balance',
        route: 'authenticated.dashboard.marketplace',
      },
      this.showBilling && {
        label: this.intl.t('billing'),
        icon: 'credit-card',
        route: 'authenticated.dashboard.billing',
      },
      this.showPartnerDashboard && {
        label: this.intl.t('clients'),
        icon: 'groups-2',
        route: 'authenticated.partner.clients',
        hasBadge: true,
        badgeLabel: this.intl.t('beta'),
        currentWhen:
          'authenticated.partner.clients authenticated.partner.client authenticated.partner.analytics',
      },
    ].filter(Boolean) as MenuItem[];
  }

  get lowerMenuItems() {
    return [
      this.enableChatSupport && {
        title: this.intl.t('chatSupport'),
        icon: 'chat-bubble',
        onClick: this.openChatBox,
        iconClass: 'lower-menu-chat',
        textClass: styles['lower-menu-chat'],
      },
      {
        title: this.versionText,
        icon: 'info',
        iconClass: 'pendo-ak-icon',
        enablePendo: this.enablePendo,
        onClick: this.showGuide,
        textClass: styles['menu-item-text'],
        listItemClass: this.enablePendo ? '' : 'no-hover',
      },
    ].filter(Boolean) as LowerMenuItem[];
  }

  get showKnowledgeBase() {
    return this.freshdesk.supportWidgetIsEnabled;
  }

  get showChatSupport() {
    return this.freshdesk.freshchatEnabled;
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
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
    this.freshdesk.openFreshchatWidget();
  }

  @action
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;

    this.window.localStorage.setItem(
      'sidebarState',
      this.isSidebarCollapsed ? 'collapsed' : 'expanded'
    );
  }

  @action
  onToggleOnboardingGuide() {
    this.showOnboardingGuide = !this.showOnboardingGuide;
  }

  @action onOpenKnowledgeBase() {
    this.freshdesk.openSupportWidget();
  }

  @action
  handleAddEditOrgNameCancel() {
    this.showAddEditModal = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AppknoxWrapper: typeof AppknoxWrapperComponent;
  }
}
