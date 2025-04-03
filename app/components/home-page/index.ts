import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import { action } from '@ember/object';

import type OrganizationService from 'irene/services/organization';
import type UserAuthService from 'irene/services/user-auth';
import type WhitelabelService from 'irene/services/whitelabel';
import type { ProductCardDetails } from './product-card';

export default class HomePageComponent extends Component {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare userAuth: UserAuthService;
  @service declare session: any;
  @service declare whitelabel: WhitelabelService;
  @service declare router: RouterService;

  faviconImage: HTMLImageElement = new Image();

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.faviconImage.src = this.whitelabel.favicon;
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

  get productCardDetails() {
    return [
      {
        title: this.isWhitelabel ? this.intl.t('vapt') : this.intl.t('appknox'),
        description: this.intl.t('appknoxDesc'),
        route: 'authenticated.dashboard.projects',
        linkText: this.intl.t('takeMeToDashboard'),
        indicatorSvg: 'ak-svg/vapt-indicator',
        coverBackgroundImage: 'ak-svg/appknox-bg-img',
      },
      {
        title: this.isWhitelabel
          ? this.intl.t('appMonitoring')
          : this.intl.t('storeknox.title'),
        description: this.intl.t('storeknox.description'),
        route: 'authenticated.storeknox.inventory.app-list', // change this
        //add route2
        indicatorSvg: 'ak-svg/sm-indicator',
        isGreyscale: !this.isStoreknoxEnabled,
        coverBackgroundImage: 'ak-svg/storeknox-bg-img',
        chipColor: this.isStoreknoxEnabled ? 'info' : 'purple',
        chipText: this.isStoreknoxEnabled
          ? this.intl.t('beta')
          : this.intl.t('trialVersion'),
        link2Text: this.isStoreknoxEnabled
          ? ''
          : this.intl.t('exploreFreeTrial'),
        linkText: this.isStoreknoxEnabled
          ? this.intl.t('takeMeToDashboard')
          : this.intl.t('upgradeNow'),
        linkDisabled: false, //change this
      },
      this.isSecurityEnabled && {
        title: this.intl.t('securityDashboard'),
        description: this.intl.t('securityDashboardDesc'),
        route: 'authenticated.security.projects',
        indicatorSvg: 'ak-svg/security-indicator',
        coverBackgroundImage: 'ak-svg/security-bg-img',
        linkText: this.intl.t('takeMeToDashboard'),
        openInNewTab: true,
      },
    ].filter(Boolean) as ProductCardDetails[];
  }

  get isSecurityEnabled() {
    return this.organization.isSecurityEnabled;
  }

  @action
  onClickAdmin() {
    this.router.transitionTo('authenticated.admin');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    HomePage: typeof HomePageComponent;
  }
}
