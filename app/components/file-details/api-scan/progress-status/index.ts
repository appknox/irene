import { service } from '@ember/service';
import Component from '@glimmer/component';
import { didCancel, task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type ApiScanService from 'irene/services/api-scan';
import type IreneAjaxService from 'irene/services/ajax';

export interface FileDetailsApiScanProgressStatusSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsApiScanProgressStatusComponent extends Component<FileDetailsApiScanProgressStatusSignature> {
  @service declare apiScan: ApiScanService;
  @service declare ajax: IreneAjaxService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  stopApiScan = task(async () => {
    try {
      const url = [
        ENV.endpoints['files'],
        this.args.file.id,
        ENV.endpoints['capturedApiScanStop'],
      ].join('/');

      await this.ajax.post(url, { namespace: ENV.namespace_v2 });

      // Confirm before reload. Reloading the file leaves this screen and
      // destroys the component, which cancels the task at the reload await.
      this.notify.success(this.intl.t('apiScanStopped'));
      await this.args.file.reload();
    } catch (error) {
      if (didCancel(error)) {
        return;
      }

      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  constructor(
    owner: unknown,
    args: FileDetailsApiScanProgressStatusSignature['Args']
  ) {
    super(owner, args);

    this.apiScan.setFooterComponent(null, {});
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::ProgressStatus': typeof FileDetailsApiScanProgressStatusComponent;
    'file-details/api-scan/progress-status': typeof FileDetailsApiScanProgressStatusComponent;
  }
}
