import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type FileModel from 'irene/models/file';
import type IreneAjaxService from 'irene/services/ajax';
import type ScanCoverageScreenModel from 'irene/models/scan-coverage-screen';

type ScreenCoverageQueryResponse =
  DS.AdapterPopulatedRecordArray<ScanCoverageScreenModel> & {
    meta: { count: number };
  };

export interface FileDetailsDynamicScanResultsCoverageTableSignature {
  Args: { file: FileModel };
}

export default class FileDetailsDynamicScanResultsCoverageTable extends Component<FileDetailsDynamicScanResultsCoverageTableSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('notification') declare notify: NotificationService;

  @tracked limit = 25;
  @tracked offset = 0;
  @tracked screenStatus = -1;
  @tracked screensCovered: ScreenCoverageQueryResponse | null = null;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanResultsCoverageTableSignature['Args']
  ) {
    super(owner, args);

    this.fetchCoverageTable.perform();
  }

  get columns() {
    return [
      {
        name: this.intl.t('scanCoverage.screenName'),
        width: 250,
        valuePath: 'identifier',
      },
      {
        name: this.intl.t('status'),
        width: 100,
        textAlign: 'right',
        component: 'file-details/dynamic-scan/results/coverage-table/status',
        headerComponent:
          'file-details/dynamic-scan/results/coverage-table/status-header',
      },
    ];
  }

  get filterApplied() {
    return this.screenStatus > -1;
  }

  get coverageTableData() {
    return this.screensCovered?.slice();
  }

  get totalCoverageCount() {
    return this.screensCovered?.meta.count ?? 0;
  }

  get noFilterResults() {
    return this.totalCoverageCount === 0 && this.filterApplied;
  }

  @action
  handleNextPrevAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = offset;

    this.fetchCoverageTable.perform();
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = 0;

    this.fetchCoverageTable.perform();
  }

  @action
  handleStatusChange(status: number) {
    this.screenStatus = status;
    this.offset = 0;

    this.fetchCoverageTable.perform();
  }

  fetchCoverageTable = task(async () => {
    try {
      const adapter = this.store.adapterFor('scan-coverage-screen');
      adapter.setNestedUrlNamespace(this.args.file.id);

      const response = (await this.store.query('scan-coverage-screen', {
        limit: this.limit,
        offset: this.offset,

        ...(this.filterApplied && {
          visited:
            this.screenStatus === ENUMS.SCAN_COVERAGE_SCREEN_STATUS.VISITED,
        }),
      })) as ScreenCoverageQueryResponse;

      this.screensCovered = response;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::CoverageTable': typeof FileDetailsDynamicScanResultsCoverageTable;
  }
}
