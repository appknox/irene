import Store from '@ember-data/store';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type { EmberTableSort } from 'ember-table';

import ENUMS from 'irene/enums';
import type AnalysisModel from 'irene/models/analysis';
import type FileModel from 'irene/models/file';

export interface FileDetailsManualScanResultsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsManualScanResultsComponent extends Component<FileDetailsManualScanResultsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;

  @tracked filterVulnerabilityType: string | number =
    ENUMS.VULNERABILITY_TYPE.MANUAL;

  @tracked sorts = [{ isAscending: false, valuePath: 'computedRisk' }];
  @tracked fileAnalyses: AnalysisModel[] = [];

  constructor(
    owner: unknown,
    args: FileDetailsManualScanResultsSignature['Args']
  ) {
    super(owner, args);

    this.fetchFileAnalyses.perform();
  }

  get tabItems() {
    return [
      {
        id: 'vulnerability-details',
        label: this.intl.t('vulnerabilityDetails'),
        route: 'authenticated.dashboard.file.manual-scan.results',
        currentWhen: 'authenticated.dashboard.file.manual-scan.results',
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
    'FileDetails::ManualScan::Results': typeof FileDetailsManualScanResultsComponent;
  }
}
