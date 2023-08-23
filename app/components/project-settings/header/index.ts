import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import ProjectModel from 'irene/models/project';

interface ProjectSettingsHeaderSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsHeaderComponent extends Component<ProjectSettingsHeaderSignature> {
  @service declare intl: IntlService;

  get project() {
    return this.args.project;
  }

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      {
        route: 'authenticated.dashboard.file',
        linkTitle: this.intl.t('scanDetails'),
        model: this.project?.get('lastFile').get('id'),
      },
      {
        route: 'authenticated.project.settings',
        linkTitle: this.intl.t('settings'),
      },
    ];
  }

  get tabItems() {
    return [
      {
        id: 'general',
        route: 'authenticated.project.settings.index',
        label: this.intl.t('generalSettings'),
      },
      {
        id: 'analysis',
        route: 'authenticated.project.settings.analysis',
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
