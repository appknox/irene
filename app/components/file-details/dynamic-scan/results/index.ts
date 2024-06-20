import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';
import type { EmberTableSort } from 'ember-table';

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
  @service declare ajax: any;

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
        width: 70,
        textAlign: 'center',
      },
      {
        name: this.intl.t('title'),
        width: 200,
        valuePath: 'vulnerability.name',
        isSortable: false,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results': typeof FileDetailsDastResults;
  }
}
