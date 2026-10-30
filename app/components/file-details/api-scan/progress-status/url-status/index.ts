import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';

export interface FileDetailsApiScanProgressStatusUrlStatusSignature {
  Element: HTMLElement;
  Args: {
    status: number;
  };
}

export default class FileDetailsApiScanProgressStatusUrlStatusComponent extends Component<FileDetailsApiScanProgressStatusUrlStatusSignature> {
  @service declare intl: IntlService;

  get isInProgress() {
    return this.args.status === ENUMS.API_SCAN_URL_STATUS.IN_PROGRESS;
  }

  get color() {
    switch (this.args.status) {
      case ENUMS.API_SCAN_URL_STATUS.COMPLETED:
        return 'success';

      case ENUMS.API_SCAN_URL_STATUS.IN_PROGRESS:
        return 'info';

      case ENUMS.API_SCAN_URL_STATUS.FAILED:
        return 'error';

      case ENUMS.API_SCAN_URL_STATUS.CANCELLED:
        return 'default';

      default:
        return 'queued';
    }
  }

  get label() {
    switch (this.args.status) {
      case ENUMS.API_SCAN_URL_STATUS.COMPLETED:
        return this.intl.t('apiScanModule.scanned');

      case ENUMS.API_SCAN_URL_STATUS.IN_PROGRESS:
        return this.intl.t('scanning');

      case ENUMS.API_SCAN_URL_STATUS.FAILED:
        return this.intl.t('failed');

      case ENUMS.API_SCAN_URL_STATUS.CANCELLED:
        return this.intl.t('cancelled');

      default:
        return this.intl.t('apiScanModule.queued');
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::ProgressStatus::UrlStatus': typeof FileDetailsApiScanProgressStatusUrlStatusComponent;
  }
}
