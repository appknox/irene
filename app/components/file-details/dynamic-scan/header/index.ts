import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import RouterService from '@ember/routing/router-service';

import type FileModel from 'irene/models/file';
import ENUMS from 'irene/enums';

export interface FileDetailsDastHeaderSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsDastHeader extends Component<FileDetailsDastHeaderSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  get file() {
    return this.args.file;
  }

  get analyses() {
    return this.file.analyses;
  }

  get currentRoute() {
    return this.router.currentRouteName;
  }

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.dashboard.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      {
        route: 'authenticated.dashboard.file',
        linkTitle: this.intl.t('scanDetails'),
        model: this.args.file.id,
      },
      {
        route: 'authenticated.dashboard.file.dynamic-scan',
        linkTitle: this.intl.t('dast'),
        model: this.args.file.id,
      },
    ];
  }

  get tabs() {
    return [
      {
        label: this.intl.t('dastTabs.manualDAST'),
        route: 'authenticated.dashboard.file.dynamic-scan.manual',
        activeRoutes: 'authenticated.dashboard.file.dynamic-scan.manual',
      },
      {
        label: this.intl.t('dastTabs.automatedDAST'),
        route: 'authenticated.dashboard.file.dynamic-scan.automated',
        activeRoutes: 'authenticated.dashboard.file.dynamic-scan.automated',
      },
      {
        label: this.intl.t('dastTabs.dastResults'),
        route: 'authenticated.dashboard.file.dynamic-scan.results',
        activeRoutes: 'authenticated.dashboard.file.dynamic-scan.results',
        count: this.args.file.dynamicVulnerabilityCount,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Header': typeof FileDetailsDastHeader;
  }
}
