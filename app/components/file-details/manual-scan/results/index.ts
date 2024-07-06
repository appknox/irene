import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type { EmberTableSort } from 'ember-table';

import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';

export interface FileDetailsManualScanResultsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsManualScanResultsComponent extends Component<FileDetailsManualScanResultsSignature> {
  @service declare intl: IntlService;

  @tracked filterVulnerabilityType: string | number =
    ENUMS.VULNERABILITY_TYPE.MANUAL;

  @tracked sorts = [{ isAscending: false, valuePath: 'computedRisk' }];

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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ManualScan::Results': typeof FileDetailsManualScanResultsComponent;
  }
}
