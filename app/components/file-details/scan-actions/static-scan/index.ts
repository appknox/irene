import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import FileModel from 'irene/models/file';

export interface FileDetailsScanActionsStaticScanSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsStaticScanComponent extends Component<FileDetailsScanActionsStaticScanSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;

  @tracked showRescanModal = false;

  get tRescanInitiated() {
    return this.intl.t('rescanInitiated');
  }

  @action
  handleRescanModalOpen() {
    this.showRescanModal = true;
  }

  handleRescanApp = task(async () => {
    try {
      const data = {
        file_id: this.args.file.id,
      };

      await this.ajax.post(ENV.endpoints['rescan'] ?? '', {
        data,
      });

      this.notify.info(this.tRescanInitiated);

      if (!this.isDestroyed) {
        this.showRescanModal = false;
      }
    } catch (error) {
      this.notify.error((error as AjaxError).payload.detail);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::StaticScan': typeof FileDetailsScanActionsStaticScanComponent;
    'file-details/scan-actions/static-scan': typeof FileDetailsScanActionsStaticScanComponent;
  }
}
