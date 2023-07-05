import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';

import FileModel from 'irene/models/file';
import RealtimeService from 'irene/services/realtime';
import TrailService from 'irene/services/trial';

export interface FileDetailsScanActionsApiScanSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsApiScanComponent extends Component<FileDetailsScanActionsApiScanSignature> {
  @service declare intl: IntlService;
  @service declare trial: TrailService;
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service declare realtime: RealtimeService;

  @tracked capturedApisCount = 0;
  @tracked showApiScanModal = false;

  get tStartingApiScan() {
    return this.intl.t('startingApiScan');
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get hasDynamicScanDone() {
    return this.args.file.isDynamicDone;
  }

  /* fetch captured apis count */
  setCapturedApisCount = task(async () => {
    const url = [
      ENV.endpoints['files'],
      this.args.file.id,
      'capturedapis',
    ].join('/');

    const data = { fileId: this.args.file.id };

    const apis = await this.ajax.request(url, {
      namespace: ENV.namespace_v2,
      data,
    });

    this.realtime.incrementProperty('CapturedApiCounter');

    try {
      this.capturedApisCount = apis.count;
    } catch (error) {
      this.notify.error((error as Error).toString());
    }
  });

  /* API scan modal actions */
  openApiScanModal = task({ drop: true }, async () => {
    if (this.hasDynamicScanDone) {
      await this.setCapturedApisCount.perform();
    }

    triggerAnalytics(
      'feature',
      ENV.csb['apiScanBtnClick'] as CsbAnalyticsFeatureData
    );

    this.showApiScanModal = true;
  });

  @action
  closeApiScanModal() {
    this.showApiScanModal = false;
  }

  /* init API scan */
  startApiScan = task(async () => {
    const dynamicUrl = [
      ENV.endpoints['files'],
      this.args.file.id,
      ENV.endpoints['capturedApiScanStart'],
    ].join('/');

    return await this.ajax.post(dynamicUrl, { namespace: ENV.namespace_v2 });
  });

  runApiScan = task(async () => {
    try {
      this.showApiScanModal = false;

      await this.startApiScan.perform();

      triggerAnalytics(
        'feature',
        ENV.csb['runAPIScan'] as CsbAnalyticsFeatureData
      );

      this.notify.success(this.tStartingApiScan);
    } catch (e) {
      const err = e as AdapterError;

      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.payload && err.payload.detail) {
        errMsg = err.payload.detail;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::ApiScan': typeof FileDetailsScanActionsApiScanComponent;
    'file-details/scan-actions/api-scan': typeof FileDetailsScanActionsApiScanComponent;
  }
}
