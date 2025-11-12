import Component from '@glimmer/component';
import { all } from 'rsvp';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { addObserver, removeObserver } from '@ember/object/observers';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import DynamicscanModel, { DsComputedStatus } from 'irene/models/dynamicscan';
import type RealtimeService from 'irene/services/realtime';
import type FileRiskModel from 'irene/models/file-risk';
import type FileModel from 'irene/models/file';
import type ConfigurationService from 'irene/services/configuration';
import type DynamicScanService from 'irene/services/dynamic-scan';
import type OrganizationService from 'irene/services/organization';

interface TabItem {
  id: string;
  label: string;
  route: string;
  activeRoutes: string;
  iconDetails?: {
    icon: 'check-circle' | 'warning' | 'block';
    color: 'success' | 'warn';
  } | null;
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
  @service declare organization: OrganizationService;
  @service declare configuration: ConfigurationService;
  @service('notifications') declare notify: NotificationService;
  @service('dynamic-scan') declare dsService: DynamicScanService;
  @service declare realtime: RealtimeService;

  @tracked fileRisk: FileRiskModel | null = null;
  @tracked lastAutomatedDynamicScan: DynamicscanModel | null = null;
  @tracked lastManualDynamicScan: DynamicscanModel | null = null;

  constructor(owner: unknown, args: FileDetailsDastHeaderSignature['Args']) {
    super(owner, args);

    this.getLastDynamicScans.perform();
    this.fetchFileRisk.perform();

    // This observer is used to reload the last automated dynamic scan when the FileAutoDynamicScanReloadCounter is incremented
    // REFER: app/services/websocket.ts (LINE: 183)
    // The workflow is =>
    // AUTO DYNAMIC SCAN STARTED -> NEW DYNAMIC SCAN CREATED ->
    // "model_created" notification is sent by backend -> FileAutoDynamicScanReloadCounter is incremented on the client from the ws service
    // -> reloadLastDynamicScans is called -> lastAutomatedDynamicScan is reloaded through this observer

    // eslint-disable-next-line ember/no-observers
    addObserver(
      this.realtime,
      'FileAutoDynamicScanReloadCounter',
      this,
      this.reloadLastDynamicScans
    );
  }

  get file() {
    return this.args.file;
  }

  get currentRoute() {
    return this.router.currentRouteName;
  }

  get dsManualScan() {
    return this.lastManualDynamicScan;
  }

  get isAutomatedScanRunning() {
    return (
      this.lastAutomatedDynamicScan?.get('isStartingOrShuttingInProgress') ||
      this.lastAutomatedDynamicScan?.get('isReadyOrRunning')
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
      !this.orgIsAnEnterprise &&
        !this.organization.hideUpsellUIStatus.dynamicScanAutomation && {
          id: 'automated-dast',
          label: this.intl.t('dastTabs.automatedDAST'),
          route: 'authenticated.dashboard.file.dynamic-scan.automated',
          activeRoutes: 'authenticated.dashboard.file.dynamic-scan.automated',
          isActive:
            this.currentRoute ===
            'authenticated.dashboard.file.dynamic-scan.automated',
          inProgress: this.isAutomatedScanRunning,
          iconDetails: this.getScanStatusIconData(
            this.lastAutomatedDynamicScan?.get('computedStatus')
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
        count: this.fileRisk?.get('riskCountByScanType')?.dynamic,
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
      return { icon: 'check-circle' as const, color: 'success' as const };
    }

    if (status === DsComputedStatus.ERROR) {
      return { icon: 'warning' as const, color: 'error' as const };
    }

    if (status === DsComputedStatus.CANCELLED) {
      return { icon: 'block' as const, color: 'error' as const };
    }

    return null;
  }

  @action
  reloadLastDynamicScans() {
    this.getLastDynamicScans.perform();
  }

  getLastDynamicScans = task(async () => {
    const [lastAutomatedDynamicScan, lastManualDynamicScan] = await all([
      this.file.getFileLastAutomatedDynamicScan(),
      this.file.getFileLastManualDynamicScan(),
    ]);

    this.lastAutomatedDynamicScan = lastAutomatedDynamicScan;
    this.lastManualDynamicScan = lastManualDynamicScan;
  });

  fetchFileRisk = task(async () => {
    if (!this.args.file) {
      return;
    }

    this.fileRisk = await this.args.file.fetchFileRisk();
  });

  willDestroy(): void {
    super.willDestroy();

    removeObserver(
      this.realtime,
      'FileAutoDynamicScanReloadCounter',
      this,
      this.reloadLastDynamicScans
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Header': typeof FileDetailsDastHeader;
  }
}
