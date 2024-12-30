import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';

import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';
import type ConfigurationService from 'irene/services/configuration';
import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';

interface TabItem {
  id: string;
  label: string;
  route: string;
  activeRoutes: string;
  inProgress?: boolean;
  count?: number;
}

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
  @service declare configuration: ConfigurationService;
  @service('notifications') declare notify: NotificationService;

  @tracked dsAutomatedScan: DynamicscanModel | null = null;

  constructor(owner: unknown, args: FileDetailsDastHeaderSignature['Args']) {
    super(owner, args);

    this.fetchLatestAutomatedScan.perform();
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
    return (
      this.dsAutomatedScan?.isStartingOrShuttingInProgress ||
      this.dsAutomatedScan?.isRunning
    );
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  get tabs() {
    return [
      {
        id: 'manual-dast',
        label: this.intl.t('dastTabs.manualDAST'),
        route: 'authenticated.dashboard.file.dynamic-scan.manual',
        activeRoutes: 'authenticated.dashboard.file.dynamic-scan.manual',
      },
      !this.orgIsAnEnterprise && {
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
    ].filter(Boolean) as TabItem[];
  }

  fetchLatestAutomatedScan = task(async () => {
    try {
      this.dsAutomatedScan = await this.file.getLastDynamicScan(
        this.file.id,
        ENUMS.DYNAMIC_MODE.AUTOMATED
      );
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Header': typeof FileDetailsDastHeader;
  }
}
