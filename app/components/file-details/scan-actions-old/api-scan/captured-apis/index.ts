import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import FileModel from 'irene/models/file';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import CapturedApiModel from 'irene/models/capturedapi';
import ENV from 'irene/config/environment';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import { action } from '@ember/object';

export interface FileDetailsScanActionsOldApiScanCapturedApisSignature {
  Args: {
    file: FileModel;
  };
}

type CapturedApiQueryResponse =
  DS.AdapterPopulatedRecordArray<CapturedApiModel> & {
    meta: { count: number };
  };

export default class FileDetailsScanActionsOldApiScanCapturedApisComponent extends Component<FileDetailsScanActionsOldApiScanCapturedApisSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked selectedCount = 0;
  @tracked capturedApiResponse: CapturedApiQueryResponse | null = null;
  @tracked limit = 5;
  @tracked offset = 0;

  constructor(
    owner: unknown,
    args: FileDetailsScanActionsOldApiScanCapturedApisSignature['Args']
  ) {
    super(owner, args);

    this.setSelectedCount.perform();
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

  setSelectedCount = task(async () => {
    try {
      const selectedApis = await this.getSelectedApis.perform();

      this.selectedCount = selectedApis.count;
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

      this.setSelectedCount.perform();
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
    } catch (error) {
      const err = error as AdapterError;
      this.notify.error(err.toString());
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActionsOld::ApiScan::CapturedApis': typeof FileDetailsScanActionsOldApiScanCapturedApisComponent;
  }
}
