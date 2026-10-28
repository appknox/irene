import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { didCancel, task } from 'ember-concurrency';
import { debounceTask } from 'ember-lifeline';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import { DsStatusGroup } from 'irene/utils/ds-status-group';
import type { AkChipColor } from 'irene/components/ak-chip';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type FileModel from 'irene/models/file';
import type { Request } from 'irene/models/capturedapi';
import type ApiScanService from 'irene/services/api-scan';
import type IreneAjaxService from 'irene/services/ajax';

export interface FileDetailsApiScanProgressStatusSignature {
  Args: {
    file: FileModel;
  };
}

// Mirrors APIScanStatusEnum in mycroft
export enum ApiScanUrlStatus {
  UNKNOWN = -1,
  PENDING = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  FAILED = 3,
  CANCELLED = 4,
}

// `request` has the same schema as the captured APIs list
export interface ApiScanUrl {
  id: number;
  request: Request;
  status: ApiScanUrlStatus;
  scanned_on: string | null;
}

interface ApiScanUrlsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiScanUrl[];
  total_count: number;
  scanned_count: number;
}

const METHOD_CHIP_COLORS: Record<string, AkChipColor> = {
  GET: 'info',
  POST: 'success',
  PUT: 'warn',
  PATCH: 'secondary',
  DELETE: 'error',
};

export default class FileDetailsApiScanProgressStatusComponent extends Component<FileDetailsApiScanProgressStatusSignature> {
  @service declare apiScan: ApiScanService;
  @service declare ajax: IreneAjaxService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked scanUrlsResponse: ApiScanUrlsResponse | null = null;
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked searchQuery = '';

  stoppingStatus = DsStatusGroup.STOPPING;

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
      // Method and Scanned At are sized to their content (widest chip /
      // header + cell padding); Endpoint absorbs the remaining width.
      { id: 'method', name: this.intl.t('method'), width: 90 },
      {
        id: 'endpoint',
        name: this.intl.t('apiScanModule.endpoint'),
        width: 300,
      },
      { id: 'status', name: this.intl.t('status'), width: 150 },
      {
        id: 'scannedOn',
        name: this.intl.t('apiScanModule.scannedAt'),
        width: 110,
      },
    ];
  }

  get scanUrls() {
    return this.scanUrlsResponse?.results ?? [];
  }

  get filteredCount() {
    return this.scanUrlsResponse?.count ?? 0;
  }

  get totalCount() {
    return this.scanUrlsResponse?.total_count ?? 0;
  }

  get scannedCount() {
    return this.scanUrlsResponse?.scanned_count ?? 0;
  }

  get hasNoScanUrls() {
    return this.filteredCount === 0;
  }

  // Only show the skeleton on the first load. Refetches triggered by
  // progress updates keep the current rows on screen to avoid flicker.
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

  @action
  methodChipColor(method: string): AkChipColor {
    return METHOD_CHIP_COLORS[method.toUpperCase()] ?? 'default';
  }

  @action
  statusDetails(status: ApiScanUrlStatus) {
    switch (status) {
      case ApiScanUrlStatus.COMPLETED:
        return {
          label: this.intl.t('apiScanModule.scanned'),
          color: 'success',
        };

      case ApiScanUrlStatus.IN_PROGRESS:
        return { label: this.intl.t('scanning'), color: 'warn' };

      case ApiScanUrlStatus.FAILED:
        return { label: this.intl.t('failed'), color: 'error' };

      case ApiScanUrlStatus.CANCELLED:
        return { label: this.intl.t('cancelled'), color: 'default' };

      default:
        return { label: this.intl.t('apiScanModule.queued'), color: 'default' };
    }
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
  handleSearchInput(event: Event) {
    debounceTask(
      this,
      'setSearchQuery',
      (event.target as HTMLInputElement).value,
      500
    );
  }

  setSearchQuery(query: string) {
    this.searchQuery = query.trim();
    this.offset = 0;

    this.fetchScanUrls.perform();
  }

  // Each URL status change moves the file's scan progress, which reaches
  // us through the realtime file update, so refetch the current page then.
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
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  stopApiScan = task(async () => {
    try {
      const url = [
        ENV.endpoints['files'],
        this.args.file.id,
        ENV.endpoints['capturedApiScanStop'],
      ].join('/');

      await this.ajax.post(url, { namespace: ENV.namespace_v2 });

      // Confirm before reload, in case the reload moves away from this
      // screen and cancels the task at the reload await.
      this.notify.success(this.intl.t('apiScanStopped'));
      await this.args.file.reload();
    } catch (error) {
      if (didCancel(error)) {
        return;
      }

      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::ProgressStatus': typeof FileDetailsApiScanProgressStatusComponent;
    'file-details/api-scan/progress-status': typeof FileDetailsApiScanProgressStatusComponent;
  }
}
