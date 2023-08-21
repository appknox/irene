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

  constructor(owner: unknown, args: ProjectSettingsHeaderSignature['Args']) {
    super(owner, args);
  }

  get breadcrumbItems() {
    const fileId = '45134'; //Todo right now this is hard coded
    
    return [
      {
        route: 'authenticated.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      {
        route: 'authenticated.dashboard.file',
        linkTitle: this.intl.t('scanDetails'),
        models: [fileId as string],
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
  
  get project() {
    return this.args.project;
  }
}


declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectSettingsHeader: typeof ProjectSettingsHeaderComponent;
    'project-settings-header': typeof ProjectSettingsHeaderComponent;
  }
}
