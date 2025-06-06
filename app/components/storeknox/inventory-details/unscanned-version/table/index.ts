import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type SkAppVersionModel from 'irene/models/sk-app-version';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

type SkAppVersionsModelArray =
  DS.AdapterPopulatedRecordArray<SkAppVersionModel> & {
    meta: { count: number };
  };

interface StoreknoxInventoryDetailsUnscannedVersionTableSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel | null;
    isHistoryTable?: boolean;
  };
}

export default class StoreknoxInventoryDetailsUnscannedVersionTableComponent extends Component<StoreknoxInventoryDetailsUnscannedVersionTableSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked skAppVersionsToDisplay: SkAppVersionModel[] = [];
  @tracked totalStoreVersions = 0;
  @tracked limit = 5;
  @tracked offset = 0;

  constructor(
    owner: unknown,
    args: StoreknoxInventoryDetailsUnscannedVersionTableSignature['Args']
  ) {
    super(owner, args);

    this.fetchSkAppVersions();
  }

  get columns() {
    return [
      this.isHistoryTable
        ? {
            name: this.intl.t('storeknox.foundOn'),
            width: 150,
            component:
              'storeknox/inventory-details/unscanned-version/table/date-found',
          }
        : null,
      {
        name: this.intl.t('storeknox.storeVersion'),
        width: this.isHistoryTable ? 100 : 150,
        component:
          'storeknox/inventory-details/unscanned-version/table/store-version',
      },
      {
        name: this.intl.t('storeknox.appStatus'),
        width: 300,
        textAlign: 'center',
        component:
          'storeknox/inventory-details/unscanned-version/table/scan-status',
      },
      {
        name: this.intl.t('storeknox.locatedIn'),
        width: 150,
        textAlign: 'center',
        component:
          'storeknox/inventory-details/unscanned-version/table/countries',
      },
      {
        name: this.intl.t('action'),
        textAlign: 'center',
        width: 180,

        component:
          'storeknox/inventory-details/unscanned-version/table/actions',

        headerComponent:
          'storeknox/inventory-details/unscanned-version/table/actions-header',
      },
    ].filter(Boolean);
  }

  get skApp() {
    return this.args.skInventoryApp;
  }

  get isHistoryTable() {
    return this.args.isHistoryTable;
  }

  get showPagination() {
    return this.isHistoryTable && this.totalStoreVersions > 5;
  }

  get noVersionsFoundMsg() {
    if (this.isHistoryTable) {
      return this.intl.t('storeknox.monitoringHistoryTableEmpty');
    }

    return this.intl.t('storeknox.monitoringDetailsTableEmpty');
  }

  get hasNoSkAppVersions() {
    return this.skAppVersionsToDisplay.length < 1;
  }

  // Table Actions
  @action goToPage({ limit, offset }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = offset;

    this.fetchSkAppVersions();
  }

  @action onItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = 0;

    this.fetchSkAppVersions();
  }

  @action fetchSkAppVersions() {
    this.fetchAllSkAppVersions.perform();
  }

  fetchAllSkAppVersions = task(async () => {
    const skAppId = this.skApp?.id;

    const query = this.isHistoryTable
      ? {
          limit: this.limit,
          offset: this.offset,
        }
      : {};

    try {
      const skAppVersions = (await this.store.query('sk-app-version', {
        sk_app_id: skAppId,
        is_latest: !this.isHistoryTable,
        ...query,
      })) as SkAppVersionsModelArray;

      this.totalStoreVersions = skAppVersions.meta.count;
      this.skAppVersionsToDisplay = skAppVersions.slice();
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::UnscannedVersion::Table': typeof StoreknoxInventoryDetailsUnscannedVersionTableComponent;
  }
}
