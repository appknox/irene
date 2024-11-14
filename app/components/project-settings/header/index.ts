import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type ProjectModel from 'irene/models/project';

interface ProjectSettingsHeaderSignature {
  Args: {
    project: ProjectModel | null;
    isDASTScenarioPage?: boolean;
  };
}

export default class ProjectSettingsHeaderComponent extends Component<ProjectSettingsHeaderSignature> {
  @service declare intl: IntlService;

  get project() {
    return this.args.project;
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
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Header': typeof ProjectSettingsHeaderComponent;
  }
}
