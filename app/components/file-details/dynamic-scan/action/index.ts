import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import {
  DsStatusGroup,
  getCumulativeDsStatusGroup,
} from 'irene/utils/ds-status-group';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type IreneAjaxService from 'irene/services/ajax';
import type DynamicScanService from 'irene/services/dynamic-scan';
import type AnalyticsService from 'irene/services/analytics';

export interface DynamicScanActionSignature {
  Args: {
    onScanShutdown?: () => void;
    openActionDrawer?: () => void;
    onBeforeShutdown?: (doShutdown: () => void) => void;
    file: FileModel;
    dynamicScanText: string;
    isAutomatedScan?: boolean;
    dynamicScans: DynamicscanModel[];
  };
}

export default class DynamicScanActionComponent extends Component<DynamicScanActionSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;
  @service('dynamic-scan') declare dsService: DynamicScanService;

  get file() {
    return this.args.file;
  }

  get projectPlatform() {
    return this.file.project.get('platform');
  }

  get dynamicScans() {
    return this.args.dynamicScans ?? [];
  }

  get cumulativeStatus() {
    return getCumulativeDsStatusGroup(
      this.dynamicScans.map((scan) => scan.status)
    );
  }

  get dynamicScanActionButton() {
    const status = this.cumulativeStatus;

    if (
      status === DsStatusGroup.IN_QUEUE ||
      status === DsStatusGroup.STARTING
    ) {
      return {
        icon: 'close' as const,
        text: this.intl.t('cancelScan'),
        testId: 'cancelBtn',
        variant: 'outlined' as const,
        color: 'neutral' as const,
        onClick: () => this.dynamicShutdown.perform(),
        loading: this.dynamicShutdown.isRunning,
        loaderColor: 'secondary' as const,
      };
    }

    if (status === DsStatusGroup.RUNNING) {
      return {
        icon: 'stop-circle' as const,
        text: this.intl.t('stop'),
        testId: 'stopBtn',
        loading: this.dynamicShutdown.isRunning,
        onClick: () =>
          this.args.onBeforeShutdown
            ? this.args.onBeforeShutdown(() => this.dynamicShutdown.perform())
            : this.dynamicShutdown.perform(),
      };
    }

    if (
      status === DsStatusGroup.COMPLETED ||
      status === DsStatusGroup.ERRORED
    ) {
      return {
        icon: 'refresh' as const,
        text: this.args.dynamicScanText,
        testId: 'restartBtn',
        onClick: this.openDynamicScanDrawer,
      };
    }

    return {
      icon: 'play-arrow' as const,
      text: this.args.dynamicScanText,
      testId: 'startBtn',
      onClick: this.openDynamicScanDrawer,
    };
  }

  @action
  openDynamicScanDrawer() {
    this.analytics.track({
      name: 'DYNAMIC_SCAN_START_EVENT',
      properties: {
        feature: 'dynamic_scan_drawer_opened',
        file_id: this.file.get('id'),
        file_name: this.file.get('name'),
      },
    });

    this.args.openActionDrawer?.();
  }

  @action
  deleteScan(scan: DynamicscanModel) {
    return this.ajax.delete(`/dynamicscans/${scan.id}`, {
      namespace: ENV.namespace_v2,
    });
  }

  @action
  async deleteMultipleScans(scans: DynamicscanModel[]) {
    const results = await Promise.allSettled(scans.map(this.deleteScan));
    const firstError = results.find((r) => r.status === 'rejected');

    if (firstError) {
      const errorMessage = this.intl.t('pleaseTryAgain');
      this.notify.error(parseError(firstError.reason, errorMessage));

      return;
    }

    this.args.onScanShutdown?.();
  }

  dynamicShutdown = task({ drop: true }, async () => {
    const runningScans = this.dynamicScans.filter(
      (s) => s.isReadyOrRunning || s.isStarting
    );

    // No need to delete (stop) any scans if there are no running scans
    if (runningScans.length === 0) {
      return;
    }

    try {
      await this.deleteMultipleScans(runningScans);

      const pollData = {
        file: this.file,
        isAutomatedScan: this.args.isAutomatedScan,
      };

      await this.dsService.pollDynamicScanStatusForSuperUser(pollData);
      this.args.onScanShutdown?.();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action': typeof DynamicScanActionComponent;
  }
}
