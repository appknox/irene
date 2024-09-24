import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationService from 'irene/services/organization';
import type ConfigurationService from 'irene/services/configuration';
import type UserAuthService from 'irene/services/user-auth';

interface productCardDetails {
  title: string;
  desc: string;
  link: string;
  indicator: 'ak-svg/sm-indicator' | 'ak-svg/vp-indicator';
  coverImage: 'ak-svg/storeknox-bg-img' | 'ak-svg/appknox-bg-img';
}

export default class HomePageComponent extends Component {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare configuration: ConfigurationService;
  @service declare userAuth: UserAuthService;
  @service declare session: any;

  get isStoreknoxEnabled() {
    return this.organization.selected?.features?.storeknox;
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  get productCardDetails() {
    return [
      {
        title: this.orgIsAnEnterprise
          ? this.intl.t('vapt')
          : this.intl.t('appknox'),
        desc: this.intl.t('appknoxDesc'),
        link: 'authenticated.dashboard.projects',
        indicator: 'ak-svg/vp-indicator',
        coverImage: 'ak-svg/appknox-bg-img',
      },
      this.isStoreknoxEnabled && {
        title: this.orgIsAnEnterprise
          ? this.intl.t('appMonitoring')
          : this.intl.t('storeknox'),
        desc: this.intl.t('storeknoxDesc'),
        link: 'authenticated.storeknox.discover',
        indicator: 'ak-svg/sm-indicator',
        coverImage: 'ak-svg/storeknox-bg-img',
      },
    ].filter(Boolean) as productCardDetails[];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    HomePage: typeof HomePageComponent;
  }
}
