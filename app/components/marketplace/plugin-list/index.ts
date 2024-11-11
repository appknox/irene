import Component from '@glimmer/component';
import constants from 'irene/components/marketplace/plugin-list/constants';
import { htmlSafe } from '@ember/template';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

export default class MarketplacePluginListComponent extends Component {
  @service declare intl: IntlService;

  showInstructionsModal = false;

  get data() {
    return [
      {
        title: this.intl.t('azurePipeline'),
        description:
          this.intl.t('installAppknoxPluginTo') + this.intl.t('azurePipeline'),
        logo: '../images/azure-icon.png',
        link: 'https://marketplace.visualstudio.com/items?itemName=appknox.appknox',
        published: true,
        instructions: '',
      },
      {
        title: this.intl.t('jenkinsPipeline'),
        description: this.intl.t('viewIntegrationInstructions'),
        logo: '../images/jenkins-icon.png',
        link: 'https://plugins.jenkins.io/appknox-scanner/',
        published: true,
        instructions: '',
      },
      {
        title: this.intl.t('circleCIPipeline'),
        description: this.intl.t('viewIntegrationInstructions'),
        logo: '../images/circleci-icon.png',
        link: '',
        published: false,
        instructions: htmlSafe(constants.instructions),
      },
      {
        title: this.intl.t('bitbucketPipeline'),
        description: this.intl.t('viewIntegrationInstructions'),
        logo: '../images/bitbucket-icon.png',
        link: '',
        published: false,
        instructions: htmlSafe(constants.instructions),
      },
      {
        title: this.intl.t('appCenterPipeline'),
        description: this.intl.t('viewIntegrationInstructions'),
        logo: '../images/app-center-icon.png',
        link: '',
        published: false,
        instructions: htmlSafe(constants.appCenterInstructions),
      },
      {
        title: this.intl.t('bitriseWorkflow'),
        description: this.intl.t('viewIntegrationInstructions'),
        logo: '../images/bitrise-icon.png',
        link: '',
        published: false,
        instructions: htmlSafe(constants.bitriseInstructions),
      },
      {
        title: this.intl.t('githubAction'),
        description: this.intl.t('viewIntegrationInstructions'),
        logo: '../images/octocat.png',
        link: 'https://github.com/marketplace/actions/appknox-github-action',
        published: true,
        instructions: '',
      },
      {
        title: this.intl.t('gitlab'),
        description: this.intl.t('viewIntegrationInstructions'),
        logo: '../images/gitlab-icon.png',
        link: '',
        published: false,
        instructions: htmlSafe(constants.instructions),
      },
      {
        title: this.intl.t('codemagic'),
        description: this.intl.t('viewIntegrationInstructions'),
        logo: '../images/codemagic-icon.png',
        link: 'https://docs.codemagic.io/integrations/appknox-integration/',
        published: true,
        instructions: '',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Marketplace::PluginList': typeof MarketplacePluginListComponent;
  }
}
