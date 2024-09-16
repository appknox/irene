import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationService from 'irene/services/organization';
import type UserAuthService from 'irene/services/user-auth';
import type WhitelabelService from 'irene/services/whitelabel';

interface productCardDetails {
  title: string;
  desc: string;
  link: string;
  indicator:
    | 'ak-svg/sm-indicator'
    | 'ak-svg/vapt-indicator'
    | 'ak-svg/security-indicator';
  coverImage:
    | 'ak-svg/storeknox-bg-img'
    | 'ak-svg/appknox-bg-img'
    | 'ak-svg/security-bg-img';
  openInNewTab?: boolean;
}

export default class HomePageComponent extends Component {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare userAuth: UserAuthService;
  @service declare session: any;
  @service declare ajax: any;
  @service declare whitelabel: WhitelabelService;

  get isStoreknoxEnabled() {
    return this.organization.selected?.features?.storeknox;
  }

  get isWhitelabel() {
    return !this.whitelabel.is_appknox_url;
  }

  get productCardDetails() {
    return [
      {
        title: this.isWhitelabel ? this.intl.t('vapt') : this.intl.t('appknox'),
        desc: this.intl.t('appknoxDesc'),
        link: 'authenticated.dashboard.projects',
        indicator: 'ak-svg/vapt-indicator',
        coverImage: 'ak-svg/appknox-bg-img',
      },
      this.isStoreknoxEnabled && {
        title: this.isWhitelabel
          ? this.intl.t('appMonitoring')
          : this.intl.t('storeknox.title'),
        desc: this.intl.t('storeknox.description'),
        link: 'authenticated.storeknox.inventory.app-list',
        indicator: 'ak-svg/sm-indicator',
        coverImage: 'ak-svg/storeknox-bg-img',
      },
      this.isSecurityEnabled && {
        title: this.intl.t('securityDashboard'),
        desc: this.intl.t('securityDashboardDesc'),
        link: 'authenticated.security.projects',
        indicator: 'ak-svg/security-indicator',
        coverImage: 'ak-svg/security-bg-img',
        openInNewTab: true,
      },
    ].filter(Boolean) as productCardDetails[];
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
