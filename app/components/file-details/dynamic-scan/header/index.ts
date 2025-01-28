import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import type FileModel from 'irene/models/file';
import type ConfigurationService from 'irene/services/configuration';
import type DynamicScanService from 'irene/services/dynamic-scan';
import { DsComputedStatus } from 'irene/models/dynamicscan';

interface TabItem {
  id: string;
  label: string;
  route: string;
  activeRoutes: string;
  iconDetails?: { icon: string; color: 'success' | 'warn' } | null;
  inProgress?: boolean;
  count?: number;
  isActive?: boolean;
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
  @service declare configuration: ConfigurationService;
  @service('dynamic-scan') declare dsService: DynamicScanService;

  get file() {
    return this.args.file;
  }

  get analyses() {
    return this.file.analyses;
  }

  get currentRoute() {
    return this.router.currentRouteName;
  }

  get dsAutomatedScan() {
    return this.file.lastAutomatedDynamicScan;
  }

  get dsManualScan() {
    return this.file.lastManualDynamicScan;
  }

  get isAutomatedScanRunning() {
    return (
      this.dsAutomatedScan?.get('isStartingOrShuttingInProgress') ||
      this.dsAutomatedScan?.get('isReadyOrRunning')
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
        isActive:
          this.currentRoute ===
          'authenticated.dashboard.file.dynamic-scan.manual',
        iconDetails: this.getScanStatusIconData(
          this.dsManualScan?.get('computedStatus')
        ),
      },
      !this.orgIsAnEnterprise && {
        id: 'automated-dast',
        label: this.intl.t('dastTabs.automatedDAST'),
        route: 'authenticated.dashboard.file.dynamic-scan.automated',
        activeRoutes: 'authenticated.dashboard.file.dynamic-scan.automated',
        isActive:
          this.currentRoute ===
          'authenticated.dashboard.file.dynamic-scan.automated',
        inProgress: this.isAutomatedScanRunning,
        iconDetails: this.getScanStatusIconData(
          this.dsAutomatedScan?.get('computedStatus')
        ),
      },
      this.dsService.showScheduledScan && {
        id: 'scheduled-automated-dast',
        label: this.intl.t('dastTabs.scheduledAutomatedDAST'),
        route: 'authenticated.dashboard.file.dynamic-scan.scheduled-automated',
        activeRoutes:
          'authenticated.dashboard.file.dynamic-scan.scheduled-automated',
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

  @action
  showTabIcon(tab: TabItem) {
    return Boolean(tab.count) || Boolean(tab.iconDetails) || tab.inProgress;
  }

  @action
  getScanStatusIconData(status: DsComputedStatus | undefined) {
    if (status === DsComputedStatus.COMPLETED) {
      return { icon: 'check-circle', color: 'success' as const };
    }

    if (status === DsComputedStatus.ERROR) {
      return { icon: 'warning', color: 'error' as const };
    }

    if (status === DsComputedStatus.CANCELLED) {
      return { icon: 'block', color: 'error' as const };
    }

    return null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Header': typeof FileDetailsDastHeader;
  }
}
