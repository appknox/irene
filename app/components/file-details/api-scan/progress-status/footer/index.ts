import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type IreneAjaxService from 'irene/services/ajax';
import type AnalyticsService from 'irene/services/analytics';

export interface FileDetailsApiScanProgressStatusFooterSignature {
  Args: {
    file: FileModel;
    data: Record<string, unknown>;
  };
}

export default class FileDetailsApiScanProgressStatusFooterComponent extends Component<FileDetailsApiScanProgressStatusFooterSignature> {
  @service declare ajax: IreneAjaxService;
  @service declare intl: IntlService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  get data() {
    return {
      scannedCount: (this.args.data['scannedCount'] as number) ?? 0,
      totalCount: (this.args.data['totalCount'] as number) ?? 0,
      cancelledCount: (this.args.data['cancelledCount'] as number) ?? 0,
    };
  }

  get isApiDone() {
    return this.args.file.isApiDone;
  }

  get progress() {
    return this.isApiDone ? 100 : (this.args.file.apiScanProgress ?? 0);
  }

  get progressColor() {
    return this.isApiDone ? ('success' as const) : ('primary' as const);
  }

  get showStopButton() {
    return this.args.file.isRunningApiScan && !this.isApiDone;
  }

  // Only endpoints a stop cancelled can be restarted
  get showRestartRemainingButton() {
    return this.isApiDone && this.data.cancelledCount > 0;
  }

  get disableStopButton() {
    return !this.args.file.isActive || this.stopApiScan.isRunning;
  }

  get disableRestartActions() {
    return (
      !this.args.file.isActive ||
      this.rescanApiScan.isRunning ||
      this.restartRemainingApiScan.isRunning
    );
  }

  get projectId() {
    return this.args.file.get('project')?.get('id');
  }

  apiScanEndpoint(endpointKey: string) {
    return [
      ENV.endpoints['files'],
      this.args.file.id,
      ENV.endpoints[endpointKey],
    ].join('/');
  }

  /**
   * Posts to a scan start endpoint, then reloads the file so the screen
   * moves to the running state.
   */
  async startScan(endpointKey: string, analyticsFeature: string) {
    try {
      await this.ajax.post(this.apiScanEndpoint(endpointKey), {
        namespace: ENV.namespace_v2,
      });

      this.analytics.track({
        name: 'API_SCAN_START_EVENT',
        properties: {
          feature: analyticsFeature,
          fileId: this.args.file.id,
          projectId: this.projectId,
        },
      });

      await this.args.file.reload();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  }

  rescanApiScan = task(async () => {
    await this.startScan('capturedApiScanStart', 'rescan_api_scan');
  });

  // Queues again only the endpoints a stop cancelled, inside the same scan
  restartRemainingApiScan = task(async () => {
    await this.startScan(
      'capturedApiScanRestartRemaining',
      'restart_remaining_api_scan'
    );
  });

  stopApiScan = task(async () => {
    try {
      await this.ajax.post(this.apiScanEndpoint('capturedApiScanStop'), {
        namespace: ENV.namespace_v2,
      });

      // Notify before reloading: the reload can leave this screen and
      // cancel the task at the await
      this.notify.success(this.intl.t('apiScanModule.scanStopped'));

      await this.args.file.reload();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/api-scan/progress-status/footer': typeof FileDetailsApiScanProgressStatusFooterComponent;
  }
}
