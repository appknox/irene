import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type IreneAjaxService from 'irene/services/ajax';

export interface FileDetailsApiScanCapturedApisFooterSignature {
  Args: {
    file: FileModel;
    data: Record<string, unknown>;
  };
}

export default class FileDetailsApiScanCapturedApisFooterComponent extends Component<FileDetailsApiScanCapturedApisFooterSignature> {
  @service declare ajax: IreneAjaxService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked openStartApiScanDrawer = false;

  get data() {
    return {
      selectedCount: this.args.data['selectedCount'] as number,
      totalCount: this.args.data['totalCount'] as number,
    };
  }

  get projectId() {
    return this.args.file.get('project')?.get('id');
  }

  @action
  handleStartApiScanDrawerOpen() {
    this.openStartApiScanDrawer = true;
  }

  @action
  handleStartApiScanDrawerClose() {
    this.openStartApiScanDrawer = false;
  }

  /* init API scan */
  startApiScan = task(async (drCloseHandler: () => void) => {
    try {
      const dynamicUrl = [
        ENV.endpoints['files'],
        this.args.file.id,
        ENV.endpoints['capturedApiScanStart'],
      ].join('/');

      await this.ajax.post(dynamicUrl, { namespace: ENV.namespace_v2 });

      // reload to updated api scan status
      await this.args.file.reload();

      // close drawer
      drCloseHandler();

      triggerAnalytics(
        'feature',
        ENV.csb['runAPIScan'] as CsbAnalyticsFeatureData
      );
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/api-scan/captured-apis/footer': typeof FileDetailsApiScanCapturedApisFooterComponent;
  }
}
