import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type ManualscanModel from 'irene/models/manualscan';

export interface FileDetailsManualScanRequestFormSignature {
  Args: {
    file: FileModel;
    manualscan: ManualscanModel | null;
  };
}

export default class FileDetailsManualScanRequestFormComponent extends Component<FileDetailsManualScanRequestFormSignature> {
  @service declare intl: IntlService;

  get manualScanFormSections() {
    return [
      {
        id: 'basic-info',
        summaryText: this.intl.t('modalCard.manual.basicAppInfo'),
        contentComponent:
          'file-details/manual-scan/request-form/basic-info' as const,
      },
      {
        id: 'login-details',
        summaryText: this.intl.t('modalCard.manual.loginDetails'),
        contentComponent:
          'file-details/manual-scan/request-form/login-details' as const,
      },
      {
        id: 'vpn-details',
        summaryText: this.intl.t('modalCard.manual.vpnDetails'),
        contentComponent:
          'file-details/manual-scan/request-form/vpn-details' as const,
      },
      {
        id: 'additional-comments',
        summaryText: this.intl.t('modalCard.manual.additionalComments'),
        contentComponent:
          'file-details/manual-scan/request-form/additional-comments' as const,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ManualScan::RequestForm': typeof FileDetailsManualScanRequestFormComponent;
  }
}
