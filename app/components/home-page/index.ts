import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationService from 'irene/services/organization';
import type UserAuthService from 'irene/services/user-auth';
import type WhitelabelService from 'irene/services/whitelabel';
import type { ProductCardDetails } from './product-card';
import type ConfigurationService from 'irene/services/configuration';

export default class HomePageComponent extends Component {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare userAuth: UserAuthService;
  @service declare session: any;
  @service declare whitelabel: WhitelabelService;
  @service declare configuration: ConfigurationService;

  faviconImage: HTMLImageElement = new Image();

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.faviconImage.src = this.whitelabel.favicon;
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  get isStoreknoxEnabled() {
    return this.organization.selected?.features?.storeknox;
  }

  get isWhitelabel() {
    return !this.whitelabel.is_appknox_url;
  }

  get logo() {
    return this.isWhitelabel ? this.whitelabel.logo : this.faviconImage.src;
  }

  get showReporting() {
    return (
      this.organization?.selected?.aiFeatures?.reporting &&
      !this.orgIsAnEnterprise
    );
  }

  get productCardDetails() {
    return [
      {
        title: this.isWhitelabel ? this.intl.t('vapt') : this.intl.t('appknox'),
        description: this.intl.t('appknoxDesc'),
        route: 'authenticated.dashboard.projects',
        indicatorSvg: 'ak-svg/vapt-indicator',
        coverBackgroundImage: 'ak-svg/appknox-bg-img',
      },
      this.isStoreknoxEnabled && {
        title: this.isWhitelabel
          ? this.intl.t('appMonitoring')
          : this.intl.t('storeknox.title'),
        description: this.intl.t('storeknox.description'),
        route: 'authenticated.storeknox.inventory.app-list',
        indicatorSvg: 'ak-svg/sm-indicator',
        coverBackgroundImage: 'ak-svg/storeknox-bg-img',
        isBeta: true,
      },
      this.showReporting && {
        title: this.intl.t('reportModule.title'),
        description: this.intl.t('reportModule.description'),
        route: 'authenticated.reports',
        indicatorSvg: 'ak-svg/report-indicator',
        coverBackgroundImage: 'ak-svg/report-bg-img',
      },
      this.isSecurityEnabled && {
        title: this.intl.t('securityDashboard'),
        description: this.intl.t('securityDashboardDesc'),
        route: 'authenticated.security.projects',
        indicatorSvg: 'ak-svg/security-indicator',
        coverBackgroundImage: 'ak-svg/security-bg-img',
        openInNewTab: true,
      },
    ].filter(Boolean) as ProductCardDetails[];
  }

  get isSecurityEnabled() {
    return this.organization.isSecurityEnabled;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    HomePage: typeof HomePageComponent;
  }
}
