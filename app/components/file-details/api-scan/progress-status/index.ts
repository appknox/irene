import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type { EmberTableSort } from 'ember-table';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import apiMethodChipColor from 'irene/utils/api-method-chip-color';
import apiScanUrlHasResults from 'irene/utils/api-scan-url-has-results';
import { DsStatusGroup } from 'irene/utils/ds-status-group';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type FileModel from 'irene/models/file';
import type { Request } from 'irene/models/capturedapi';
import type ApiScanService from 'irene/services/api-scan';
import type IreneAjaxService from 'irene/services/ajax';
import type { ApiScanUrlVulnerabilityCounts } from './vulnerability-counts';

export interface ApiScanUrl {
  id: number;
  request: Request;
  status: number;
  scanned_on: string | null;
  vulnerability_counts: ApiScanUrlVulnerabilityCounts;
}

interface ApiScanUrlsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiScanUrl[];
  total_count: number;
  scanned_count: number;
  cancelled_count: number;
}

export interface FileDetailsApiScanProgressStatusSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsApiScanProgressStatusComponent extends Component<FileDetailsApiScanProgressStatusSignature> {
  @service declare apiScan: ApiScanService;
  @service declare ajax: IreneAjaxService;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  stoppingStatus = DsStatusGroup.STOPPING;
  runningStatus = DsStatusGroup.RUNNING;
  completedStatus = DsStatusGroup.COMPLETED;

  @tracked scanUrlsResponse: ApiScanUrlsResponse | null = null;
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked searchQuery = '';
  @tracked sorts: EmberTableSort[] = [];

  constructor(
    owner: unknown,
    args: FileDetailsApiScanProgressStatusSignature['Args']
  ) {
    super(owner, args);

    this.apiScan.setFooterComponent(null, {});
    this.fetchScanUrls.perform();
  }

  get columns() {
    return [
      {
        id: 'endpoint',
        name: this.intl.t('apiScanModule.endpoint'),
        width: 400,
        isSortable: false,
      },
      {
        id: 'status',
        name: this.intl.t('status'),
        valuePath: 'status',
        width: 150,
      },
      {
        id: 'vulnerabilities',
        name: this.intl.t('vulnerabilities'),
        valuePath: 'vulnerability_count',
        width: 170,
        minWidth: 170,
        isCentered: true,
      },
      {
        id: 'scannedOn',
        name: this.intl.t('apiScanModule.scannedAt'),
        valuePath: 'scanned_on',
        width: 150,
        minWidth: 150,
      },
    ];
  }

  get scanUrls() {
    return this.scanUrlsResponse?.results ?? [];
  }

  get filteredCount() {
    return this.scanUrlsResponse?.count ?? 0;
  }

  get hasNoScanUrls() {
    return this.filteredCount === 0;
  }

  // Refetches on progress updates keep the current rows instead of the skeleton
  get showListLoading() {
    return this.fetchScanUrls.isRunning && !this.scanUrlsResponse;
  }

  // Column valuePaths match the API's ordering fields
  get ordering() {
    const [sort] = this.sorts;

    if (!sort) {
      return '';
    }

    return sort.isAscending ? sort.valuePath : `-${sort.valuePath}`;
  }

  get scanUrlsEndpoint() {
    return [
      ENV.endpoints['files'],
      this.args.file.id,
      ENV.endpoints['apiScanUrls'],
    ].join('/');
  }

  setFooterComponentDetails() {
    this.apiScan.setFooterComponent(
      'file-details/api-scan/progress-status/footer',
      {
        scannedCount: this.scanUrlsResponse?.scanned_count ?? 0,
        totalCount: this.scanUrlsResponse?.total_count ?? 0,
        cancelledCount: this.scanUrlsResponse?.cancelled_count ?? 0,
      }
    );
  }

  // Rows arrive sorted from the API; stop ember-table re-sorting the page
  @action
  isRowClickable(scanUrl: ApiScanUrl) {
    return apiScanUrlHasResults(
      scanUrl.status,
      scanUrl.vulnerability_counts.total
    );
  }

  // Opens the endpoint's vulnerabilities; modifier-click opens a tab
  @action
  handleRowClick({
    rowValue,
    event,
  }: {
    rowValue: ApiScanUrl;
    event: MouseEvent;
  }) {
    if (!this.isRowClickable(rowValue)) {
      return;
    }

    const route = 'authenticated.dashboard.file.api-scan.endpoint';
    const fileId = this.args.file.id;
    const id = String(rowValue.id);

    if (event.ctrlKey || event.metaKey) {
      window.open(this.router.urlFor(route, fileId, id), '_blank');
    } else {
      this.router.transitionTo(route, fileId, id);
    }
  }

  @action
  keepServerOrder() {
    return 0;
  }

  @action
  methodChipColor(method: string) {
    return apiMethodChipColor(method);
  }

  @action
  formatScannedOn(scannedOn: string | null) {
    return scannedOn ? dayjs(scannedOn).format('HH:mm:ss') : '—';
  }

  @action
  formatScannedOnTitle(scannedOn: string | null) {
    return scannedOn ? dayjs(scannedOn).format('DD MMM YYYY, HH:mm:ss') : '';
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = offset;

    this.fetchScanUrls.perform();
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = 0;

    this.fetchScanUrls.perform();
  }

  @action
  handleSortsUpdate(sorts: EmberTableSort[]) {
    // The API orders by one field; a modifier-click must not stack sorts
    this.sorts = sorts.slice(-1);
    this.offset = 0;

    this.fetchScanUrls.perform();
  }

  @action
  handleSearch(query: string) {
    this.searchQuery = query;
    this.offset = 0;

    this.fetchScanUrls.perform();
  }

  // Every URL status change moves the file's scan progress, which arrives
  // through the realtime file update
  @action
  handleScanProgressChange() {
    this.fetchScanUrls.perform();
  }

  fetchScanUrls = task({ restartable: true }, async () => {
    const queryParams = new URLSearchParams({
      limit: String(this.limit),
      offset: String(this.offset),
      q: this.searchQuery,
      ...(this.ordering ? { ordering: this.ordering } : {}),
    }).toString();

    try {
      this.scanUrlsResponse = await this.ajax.request<ApiScanUrlsResponse>(
        `${this.scanUrlsEndpoint}?${queryParams}`,
        { namespace: ENV.namespace_v2 }
      );

      this.setFooterComponentDetails();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  willDestroy(): void {
    super.willDestroy();

    this.apiScan.setFooterComponent(null, {});
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::ProgressStatus': typeof FileDetailsApiScanProgressStatusComponent;
    'file-details/api-scan/progress-status': typeof FileDetailsApiScanProgressStatusComponent;
  }
}
