import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type OrganizationService from 'irene/services/organization';
import type IreneAjaxService from 'irene/services/ajax';

export interface FileDetailsManualScanRequestAccessSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsManualScanRequestAccessComponent extends Component<FileDetailsManualScanRequestAccessSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  requestManualScanAccess = task(async () => {
    try {
      const url = [
        ENV.endpoints['organizations'],
        this.organization.selected?.id,
        ENV.endpoints['requestAccess'],
      ].join('/');

      await this.ajax.post(url);

      this.notify.success(this.intl.t('accessRequested'));

      await this.args.file.reload();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ManualScan::RequestAccess': typeof FileDetailsManualScanRequestAccessComponent;
    'file-details/manual-scan/request-access': typeof FileDetailsManualScanRequestAccessComponent;
  }
}
