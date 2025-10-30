import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import FileRiskModel from 'irene/models/file-risk';
import type ApiScanService from 'irene/services/api-scan';
import { tracked } from 'tracked-built-ins';

export interface FileDetailsApiScanSignature {
  Args: {
    file: FileModel;
  };
  Blocks: {
    default: [];
  };
}

export default class FileDetailsApiScanComponent extends Component<FileDetailsApiScanSignature> {
  @service declare intl: IntlService;
  @service declare apiScan: ApiScanService;

  @tracked fileRisk: FileRiskModel | null = null;

  constructor(owner: unknown, args: FileDetailsApiScanSignature['Args']) {
    super(owner, args);

    this.fetchFileRisk.perform();
  }

  get tabItems() {
    return [
      {
        id: 'api-scan',
        label: this.intl.t('apiScan'),
        route: 'authenticated.dashboard.file.api-scan.index',
        currentWhen: 'authenticated.dashboard.file.api-scan.index',
      },
      {
        id: 'api-results',
        label: this.intl.t('apiScanResults'),
        hasBadge: this.isApiScanRunningOrDone,
        badgeCount: this.fileRisk?.get('riskCountByScanType')?.api,
        route: 'authenticated.dashboard.file.api-scan.results',
        currentWhen: 'authenticated.dashboard.file.api-scan.results',
      },
    ];
  }

  get isApiScanRunningOrDone() {
    return this.args.file.isRunningApiScan || this.args.file.isApiDone;
  }

  fetchFileRisk = task(async () => {
    if (this.args.file) {
      this.fileRisk = await this.args.file.fetchFileRisk();
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan': typeof FileDetailsApiScanComponent;
  }
}
