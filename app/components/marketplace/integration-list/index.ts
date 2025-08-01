import Component from '@glimmer/component';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import type IntlService from 'ember-intl/services/intl';

import constants from '../plugin-list/constants';

export default class MarketplaceIntegrationListComponent extends Component {
  @service declare intl: IntlService;

  get data() {
    return [
      {
        title: this.intl.t('github'),
        description: this.intl.t('integrateAppknoxTo') + this.intl.t('github'),
        logo: '../images/github-icon.png',
        link: 'authenticated.dashboard.organization-settings.integrations',
      },
      {
        title: this.intl.t('jira'),
        description: this.intl.t('integrateAppknoxTo') + this.intl.t('jira'),
        logo: '../images/jira-icon.png',
        link: 'authenticated.dashboard.organization-settings.integrations',
      },
      {
        title: this.intl.t('serviceNow.title'),
        description:
          this.intl.t('integrateAppknoxTo') + this.intl.t('serviceNow.title'),
        logo: '../images/service-now.png',
        link: 'authenticated.dashboard.organization-settings.integrations',
      },
      {
        title: this.intl.t('splunk.title'),
        description:
          this.intl.t('integrateAppknoxTo') + this.intl.t('splunk.title'),
        logo: '../images/splunk-icon.png',
        link: 'authenticated.dashboard.organization-settings.integrations',
      },
      {
        title: this.intl.t('slack.title'),
        description:
          this.intl.t('integrateAppknoxTo') + this.intl.t('slack.title'),
        logo: '../images/slack-icon.png',
        link: 'authenticated.dashboard.organization-settings.integrations',
      },
      {
        title: this.intl.t('armorcode'),
        description: this.intl.t('viewIntegrationInstructions'),
        logo: '../images/armorcode-icon.png',
        link: '',
        published: false,
        modalHeading: this.intl.t('integrationSteps'),
        instructions: htmlSafe(constants.armorcodeInstructions),
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Marketplace::IntegrationList': typeof MarketplaceIntegrationListComponent;
  }
}
