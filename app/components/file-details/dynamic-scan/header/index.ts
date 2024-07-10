import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import RouterService from '@ember/routing/router-service';
import Store from '@ember-data/store';
import DynamicscanModel from 'irene/models/dynamicscan';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

import type FileModel from 'irene/models/file';
import parseError from 'irene/utils/parse-error';

export interface FileDetailsDastHeaderSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDastHeader extends Component<FileDetailsDastHeaderSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked dynamicScan: DynamicscanModel | null = null;

  constructor(owner: unknown, args: FileDetailsDastHeaderSignature['Args']) {
    super(owner, args);

    this.fetchDynamicscan.perform();
  }

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
    return this.dynamicScan?.isRunning;
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
        id: 'manual-dast',
        label: this.intl.t('dastTabs.manualDAST'),
        route: 'authenticated.dashboard.file.dynamic-scan.manual',
        activeRoutes: 'authenticated.dashboard.file.dynamic-scan.manual',
      },
      {
        id: 'automated-dast',
        label: this.intl.t('dastTabs.automatedDAST'),
        route: 'authenticated.dashboard.file.dynamic-scan.automated',
        activeRoutes: 'authenticated.dashboard.file.dynamic-scan.automated',
        inProgress: this.isAutomatedScanRunning,
      },
      {
        id: 'dast-results',
        label: this.intl.t('dastTabs.dastResults'),
        route: 'authenticated.dashboard.file.dynamic-scan.results',
        activeRoutes: 'authenticated.dashboard.file.dynamic-scan.results',
        count: this.args.file.dynamicVulnerabilityCount,
      },
    ];
  }

  fetchDynamicscan = task(async () => {
    const id = this.args.profileId;

    try {
      const dynScan = await this.store.findRecord('dynamicscan', id);

      this.dynamicScan = dynScan;
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Header': typeof FileDetailsDastHeader;
  }
}
