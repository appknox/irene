import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENV from 'irene/config/environment';
import type UserModel from 'irene/models/user';
import type MeService from 'irene/services/me';
import type IntegrationService from 'irene/services/integration';
import type OrganizationService from 'irene/services/organization';
import type ConfigurationService from 'irene/services/configuration';
import type { MenuItem } from '../side-nav';

export interface AppknoxWrapperSignature {
  Args: {
    user: UserModel;
  };

  Blocks: {
    default: [];
  };
}

export default class AppknoxWrapperComponent extends Component<AppknoxWrapperSignature> {
  @service declare session: any;
  @service declare me: MeService;
  @service declare intl: IntlService;
  @service declare router: RouterService;
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
  productVersion = ENV.productVersions['appknox'];

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

  get showPublicApiDocs() {
    return this.organization?.selected?.features?.public_apis;
  }

  get showSbomDashboard() {
    return (
      !this.orgIsAnEnterprise && !this.organization.hideUpsellUIStatus.sbom
    );
  }

  get showPrivacyDashboard() {
    return (
      !this.orgIsAnEnterprise &&
      !this.organization.hideUpsellUIStatus.privacyModule
    );
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
      this.showPrivacyDashboard && {
        label: this.intl.t('privacyModule.title'),
        icon: 'shield-outline',
        route: 'authenticated.dashboard.privacy-module',
        currentWhen: 'authenticated.dashboard.privacy-module',
      },
      this.showSbomDashboard && {
        label: this.intl.t('SBOM'),
        icon: 'receipt-long',
        route: 'authenticated.dashboard.sbom.apps',
        query: { app_offset: 0 },
        currentWhen: 'authenticated.dashboard.sbom',
      },
      this.isShowAnalytics && {
        label: this.intl.t('analytics'),
        icon: 'graphic-eq',
        route: 'authenticated.dashboard.analytics',
      },
      {
        label: this.intl.t('organization'),
        icon: 'group',
        route: 'authenticated.dashboard.organization.namespaces',
        currentWhen:
          'authenticated.dashboard.organization.namespaces authenticated.dashboard.organization.users authenticated.dashboard.organization.teams authenticated.dashboard.organization-settings authenticated.dashboard.service-account-details authenticated.dashboard.service-account-create',
      },
      this.showPublicApiDocs && {
        label: this.intl.t('apiDocumentation'),
        icon: 'hugeicons:api',
        route: 'authenticated.dashboard.public-api.docs',
        currentWhen: 'authenticated.dashboard.public-api.docs',
      },
      {
        label: this.intl.t('accountSettings'),
        icon: 'account-box',
        route: 'authenticated.dashboard.account-settings.general',
        currentWhen:
          'authenticated.dashboard.account-settings.general authenticated.dashboard.account-settings.security authenticated.dashboard.account-settings.developersettings authenticated.dashboard.account-settings.notification-settings',
      },
      this.showMarketplace && {
        label: this.intl.t('marketplace'),
        icon: 'account-balance',
        route: 'authenticated.dashboard.marketplace',
      },
      this.showBilling && {
        label: this.intl.t('billing'),
        icon: 'credit-card-outline',
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

  get guideCategories() {
    return [
      {
        category: this.intl.t('onboardingGuideModule.VA'),
        guides: [
          {
            id: 'va-guide',
            title: this.intl.t('onboardingGuideModule.initiateVA'),
            url: 'https://appknox.portal.trainn.co/share/bEK4jmKvG16y1lqH9b9sPA/embed?mode=interactive',
          },
          {
            id: 'scan-results-guide',
            title: this.intl.t('onboardingGuideModule.viewReports'),
            url: 'https://appknox.portal.trainn.co/share/gKJQU8gka8sX3ZLJD80CWg/embed?mode=interactive',
          },
          {
            id: 'invitation-guide',
            title: this.intl.t('inviteUsers'),
            url: 'https://appknox.portal.trainn.co/share/bXBvltZ53ZpWxvrrhrqkbA/embed?mode=interactive',
          },
          {
            id: 'creating-teams-guide',
            title: this.intl.t('onboardingGuideModule.createTeams'),
            url: 'https://appknox.portal.trainn.co/share/01VQVnUV64rjHIBsx6tzqQ/embed?mode=interactive',
          },
          {
            id: 'upload-access-guide',
            title: this.intl.t('onboardingGuideModule.uploadAccess'),
            url: 'https://appknox.portal.trainn.co/share/FPsW0wVu5g6NtAZzHjrNrA/embed?mode=interactive',
          },
        ],
      },
      {
        category: this.intl.t('SBOM'),
        guides: [
          {
            id: 'sbom-guide',
            title: this.intl.t('onboardingGuideModule.generateSBOM'),
            url: 'https://appknox.portal.trainn.co/share/mMfpJY5qpu0czTtC4TKdtQ/embed?mode=interactive',
          },
        ],
      },
    ];
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
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
