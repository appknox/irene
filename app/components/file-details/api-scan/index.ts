import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type ApiScanService from 'irene/services/api-scan';

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

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.dashboard.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      {
        route: 'authenticated.dashboard.file',
        linkTitle: this.intl.t('scanDetails'),
        model: this.args.file.id,
      },
      {
        route: 'authenticated.dashboard.file.api-scan',
        linkTitle: this.intl.t('apiScanResults'),
        model: this.args.file.id,
      },
    ];
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
        badgeCount: this.args.file.apiVulnerabilityCount,
        route: 'authenticated.dashboard.file.api-scan.results',
        currentWhen: 'authenticated.dashboard.file.api-scan.results',
      },
    ];
  }

  get isApiScanRunningOrDone() {
    return this.args.file.isRunningApiScan || this.args.file.isApiDone;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan': typeof FileDetailsApiScanComponent;
  }
}
