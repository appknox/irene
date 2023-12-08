import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import ProjectModel from 'irene/models/project';

interface ProjectSettingsHeaderSignature {
  Args: {
    project: ProjectModel | null;
    hideProjectHeaderAndTabs?: boolean;
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
        route: 'authenticated.project.settings',
        linkTitle: this.project?.get('packageName'),
        model: this.project?.get('id'),
      },
      this.args.hideProjectHeaderAndTabs
        ? {
            route: 'authenticated.project.settings',
            linkTitle: 'Dast Automation',
            model: this.project?.get('id'),
          }
        : {
            route: 'authenticated.project.settings',
            linkTitle: this.intl.t('settings'),
            model: this.project?.get('id'),
          },
    ];
  }

  get tabItems() {
    return [
      {
        id: this.intl.t('generalSettings'),
        route: 'authenticated.project.settings.index',
        label: this.intl.t('generalSettings'),
      },
      {
        id: this.intl.t('analysisSettings'),
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
