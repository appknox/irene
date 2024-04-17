import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

export default class MarketplaceIntegrationListComponent extends Component {
  @service declare intl: IntlService;

  get data() {
    return [
      {
        title: this.intl.t('github'),
        description: this.intl.t('integrateAppknoxTo') + this.intl.t('github'),
        logo: '../images/github-icon.png',
        link: 'authenticated.dashboard.organization-settings',
      },
      {
        title: this.intl.t('jira'),
        description: this.intl.t('integrateAppknoxTo') + this.intl.t('jira'),
        logo: '../images/jira-icon.png',
        link: 'authenticated.dashboard.organization-settings',
      },
      {
        title: this.intl.t('slack'),
        description: this.intl.t('comingSoon'),
        logo: '../images/slack-icon.png',
        link: '',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Marketplace::IntegrationList': typeof MarketplaceIntegrationListComponent;
  }
}
