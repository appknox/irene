import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import apiMethodChipColor from 'irene/utils/api-method-chip-color';
import { DsStatusGroup } from 'irene/utils/ds-status-group';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type FileModel from 'irene/models/file';
import type { Request } from 'irene/models/capturedapi';
import type ApiScanService from 'irene/services/api-scan';
import type IreneAjaxService from 'irene/services/ajax';

export interface ApiScanUrl {
  id: number;
  request: Request;
  status: number;
  scanned_on: string | null;
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
  @service('notifications') declare notify: NotificationService;

  stoppingStatus = DsStatusGroup.STOPPING;
  runningStatus = DsStatusGroup.RUNNING;
  completedStatus = DsStatusGroup.COMPLETED;

  @tracked scanUrlsResponse: ApiScanUrlsResponse | null = null;
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked searchQuery = '';

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
      },
      { id: 'status', name: this.intl.t('status'), width: 150 },
      {
        id: 'scannedOn',
        name: this.intl.t('apiScanModule.scannedAt'),
        width: 140,
        minWidth: 140,
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
