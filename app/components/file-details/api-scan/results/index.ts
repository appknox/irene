import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type { EmberTableSort } from 'ember-table';

import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';
import ApiScanService from 'irene/services/api-scan';

export interface FileDetailsApiScanResultsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsApiScanResultsComponent extends Component<FileDetailsApiScanResultsSignature> {
  @service declare intl: IntlService;
  @service declare apiScan: ApiScanService;

  @tracked filterVulnerabilityType: string | number =
    ENUMS.VULNERABILITY_TYPE.API;

  @tracked sorts = [{ isAscending: false, valuePath: 'computedRisk' }];

  constructor(
    owner: unknown,
    args: FileDetailsApiScanResultsSignature['Args']
  ) {
    super(owner, args);

    this.apiScan.setFooterComponent(null, {});
  }

  get tabItems() {
    return [
      {
        id: 'vulnerability-details',
        label: this.intl.t('vulnerabilityDetails'),
        route: 'authenticated.dashboard.file.api-scan.results',
        currentWhen: 'authenticated.dashboard.file.api-scan.results',
      },
    ];
  }

  get columns() {
    return [
      {
        name: this.intl.t('impact'),
        valuePath: 'computedRisk',
        component: 'file-details/vulnerability-analysis/impact',
        width: 50,
        textAlign: 'center',
      },
      {
        name: this.intl.t('title'),
        width: 250,
        valuePath: 'vulnerability.name',
        isSortable: false,
      },
    ];
  }

  @action
  updateAnalysesSorts(sorts: EmberTableSort[]) {
    this.sorts = sorts;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::Results': typeof FileDetailsApiScanResultsComponent;
  }
}
