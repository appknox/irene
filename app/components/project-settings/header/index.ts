import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type ProjectModel from 'irene/models/project';
import type BreadcrumbsService from 'irene/services/breadcrumbs';
import type RouterService from '@ember/routing/router-service';

interface ProjectSettingsHeaderSignature {
  Args: {
    project: ProjectModel | null;
    isDASTScenarioPage?: boolean;
  };
}

export default class ProjectSettingsHeaderComponent extends Component<ProjectSettingsHeaderSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('breadcrumbs') declare bCS: BreadcrumbsService;

  get project() {
    return this.args.project;
  }

  get breadcrumbItems() {
    const isFromFileDetailsPage = this.bCS.getPageReferrer() === 'file_details';
    const referringFileID = this.router.currentRoute?.queryParams['file_id'];

    return [
      {
        route: 'authenticated.dashboard.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      referringFileID && isFromFileDetailsPage
        ? {
            route: 'authenticated.dashboard.file',
            linkTitle: this.intl.t('scanDetails'),
            model: referringFileID,
          }
        : {
            route: 'authenticated.dashboard.project.settings',
            linkTitle: this.project?.get('packageName'),
            model: this.project?.get('id'),
          },
      this.args.isDASTScenarioPage
        ? {
            route: 'authenticated.dashboard.project.settings',
            linkTitle: this.intl.t('dastAutomation.dastAutomationScenario'),
            model: this.project?.get('id'),
          }
        : {
            route: 'authenticated.dashboard.project.settings',
            linkTitle: this.intl.t('settings'),
            model: this.project?.get('id'),
          },
    ];
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
