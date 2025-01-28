import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type ProjectModel from 'irene/models/project';
import type ConfigurationService from 'irene/services/configuration';

interface ProjectSettingsHeaderSignature {
  Args: {
    project: ProjectModel | null;
    isDASTScenarioPage?: boolean;
  };
}

interface TabItem {
  id: string;
  label: string;
  route: string;
}

export default class ProjectSettingsHeaderComponent extends Component<ProjectSettingsHeaderSignature> {
  @service declare intl: IntlService;
  @service declare configuration: ConfigurationService;

  get project() {
    return this.args.project;
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  get tabItems() {
    return [
      {
        id: this.intl.t('generalSettings'),
        route: 'authenticated.dashboard.project.settings.index',
        label: this.intl.t('generalSettings'),
      },
      {
        id: this.intl.t('analysisSettings'),
        route: 'authenticated.dashboard.project.settings.analysis',
        label: this.intl.t('analysisSettings'),
      },
      !this.orgIsAnEnterprise && {
        id: this.intl.t('dastAutomation.title'),
        route: 'authenticated.dashboard.project.settings.dast-automation',
        label: this.intl.t('dastAutomation.title'),
      },
    ].filter(Boolean) as TabItem[];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Header': typeof ProjectSettingsHeaderComponent;
  }
}
