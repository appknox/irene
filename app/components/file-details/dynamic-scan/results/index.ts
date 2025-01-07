import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import type { EmberTableSort } from 'ember-table';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import ENUMS from 'irene/enums';

export interface FileDetailsDastResultsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsDastResults extends Component<FileDetailsDastResultsSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked sorts: EmberTableSort[] = [
    { isAscending: false, valuePath: 'computedRisk' },
  ];

  get filterBy() {
    return ENUMS.VULNERABILITY_TYPE.DYNAMIC;
  }

  @action
  updateSorts(sorts: EmberTableSort[]) {
    this.sorts = sorts;
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

  get tabItems() {
    return [
      {
        id: 'vulnerability-details',
        label: this.intl.t('vulnerabilityDetails'),
        route: 'authenticated.dashboard.file.dynamic-scan.results',
        currentWhen: 'authenticated.dashboard.file.dynamic-scan.results',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results': typeof FileDetailsDastResults;
  }
}
