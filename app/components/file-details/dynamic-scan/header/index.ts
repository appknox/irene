import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';

import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';

export interface FileDetailsDastHeaderSignature {
  Args: {
    file: FileModel;
    profileId: number;
    dynamicScan: DynamicscanModel | null;
  };
}

export default class FileDetailsDastHeader extends Component<FileDetailsDastHeaderSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  get file() {
    return this.args.file;
  }

  get analyses() {
    return this.file.analyses;
  }

  get currentRoute() {
    return this.router.currentRouteName;
  }

  get isAutomatedScanRunning() {
    return this.args.dynamicScan?.isRunning;
  }

  get tabs() {
    return [
      {
        id: 'manual-dast',
        label: this.intl.t('dastTabs.manualDAST'),
        route: 'authenticated.dashboard.file.dynamic-scan.manual',
        activeRoutes: 'authenticated.dashboard.file.dynamic-scan.manual',
      },
      // {
      //   id: 'automated-dast',
      //   label: this.intl.t('dastTabs.automatedDAST'),
      //   route: 'authenticated.dashboard.file.dynamic-scan.automated',
      //   activeRoutes: 'authenticated.dashboard.file.dynamic-scan.automated',
      //   inProgress: this.isAutomatedScanRunning,
      // },
      {
        id: 'dast-results',
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
