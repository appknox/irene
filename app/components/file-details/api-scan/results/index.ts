import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type { EmberTableSort } from 'ember-table';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type AnalysisModel from 'irene/models/analysis';
import type FileModel from 'irene/models/file';
import type ApiScanService from 'irene/services/api-scan';
import Store from '@ember-data/store';

export interface FileDetailsApiScanResultsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsApiScanResultsComponent extends Component<FileDetailsApiScanResultsSignature> {
  @service declare intl: IntlService;
  @service declare apiScan: ApiScanService;
  @service declare store: Store;

  @tracked filterVulnerabilityType: string | number =
    ENUMS.VULNERABILITY_TYPE.API;

  @tracked sorts = [{ isAscending: false, valuePath: 'computedRisk' }];
  @tracked fileAnalyses: AnalysisModel[] = [];

  constructor(
    owner: unknown,
    args: FileDetailsApiScanResultsSignature['Args']
  ) {
    super(owner, args);

    this.apiScan.setFooterComponent(null, {});
    this.fetchFileAnalyses.perform();
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

  fetchFileAnalyses = task(async () => {
    const analyses = await this.store.query('analysis', {
      fileId: this.args.file.id,
    });

    this.fileAnalyses = analyses.slice();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::Results': typeof FileDetailsApiScanResultsComponent;
  }
}
