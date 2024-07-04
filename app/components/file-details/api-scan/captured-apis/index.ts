import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import ENV from 'irene/config/environment';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type FileModel from 'irene/models/file';
import type CapturedApiModel from 'irene/models/capturedapi';
import type ApiScanService from 'irene/services/api-scan';

export interface FileDetailsApiScanCapturedApisSignature {
  Args: {
    file: FileModel;
  };
}

type CapturedApiQueryResponse =
  DS.AdapterPopulatedRecordArray<CapturedApiModel> & {
    meta: { count: number };
  };

export default class FileDetailsApiScanCapturedApisComponent extends Component<FileDetailsApiScanCapturedApisSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service declare store: Store;
  @service declare apiScan: ApiScanService;
  @service('notifications') declare notify: NotificationService;

  @tracked selectedCount = 0;
  @tracked capturedApiResponse: CapturedApiQueryResponse | null = null;
  @tracked limit = 10;
  @tracked offset = 0;

  constructor(
    owner: unknown,
    args: FileDetailsApiScanCapturedApisSignature['Args']
  ) {
    super(owner, args);

    this.setSelectedApiCount.perform();
    this.fetchCapturedApis.perform(this.limit, this.offset);
  }

  get capturedApiList() {
    return this.capturedApiResponse?.toArray() || [];
  }

  get totalCapturedApiCount() {
    return this.capturedApiResponse?.meta?.count || 0;
  }

  get hasNoCapturedApi() {
    return this.totalCapturedApiCount === 0;
  }

  setFooterComponentDetails() {
    if (this.hasNoCapturedApi) {
      return;
    }

    this.apiScan.setFooterComponent(
      'file-details/api-scan/captured-apis/footer',
      {
        selectedCount: this.selectedCount,
        totalCount: this.totalCapturedApiCount,
      }
    );
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = offset;

    this.fetchCapturedApis.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.offset = 0;

    this.fetchCapturedApis.perform(limit, this.offset);
  }

  getSelectedApis = task(async () => {
    const url = [
      ENV.endpoints['files'],
      this.args.file.id,
      'capturedapis',
    ].join('/');

    const data = { fileId: this.args.file.id, is_active: true };

    return await this.ajax.request(url, { namespace: ENV.namespace_v2, data });
  });

  setSelectedApiCount = task(async () => {
    try {
      const selectedApis = await this.getSelectedApis.perform();

      this.selectedCount = selectedApis.count;

      // update for selected count
      this.setFooterComponentDetails();
    } catch (error) {
      const err = error as AdapterError;
      this.notify.error(err.toString());
    }
  });

  toggleApi = task(async (capturedApi: CapturedApiModel) => {
    try {
      capturedApi.set('isActive', !capturedApi.isActive);

      await capturedApi.save();

      this.notify.success(this.intl.t('capturedApiSaveSuccessMsg'));

      this.setSelectedApiCount.perform();
    } catch (err) {
      const error = err as AdapterError;
      let errMsg = this.intl.t('tPleaseTryAgain');

      if (error.errors && error.errors.length) {
        errMsg = error.errors[0]?.detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }

      this.notify.error(errMsg);
    }
  });

  fetchCapturedApis = task(async (limit: number, offset: number) => {
    try {
      this.capturedApiResponse = (await this.store.query('capturedapi', {
        limit,
        offset,
        fileId: this.args.file.id,
      })) as CapturedApiQueryResponse;

      // update for total count
      this.setFooterComponentDetails();
    } catch (error) {
      const err = error as AdapterError;
      this.notify.error(err.toString());
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::CapturedApis': typeof FileDetailsApiScanCapturedApisComponent;
    'file-details/api-scan/captured-apis': typeof FileDetailsApiScanCapturedApisComponent;
  }
}
