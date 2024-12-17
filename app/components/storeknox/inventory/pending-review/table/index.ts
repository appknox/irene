import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SkAppModel from 'irene/models/sk-app';

interface LimitOffset {
  limit: number;
  offset: number;
}

export interface StoreknoxInventoryPendingReviewTableSignature {
  Args: {
    skAppList: SkAppModel[];
    limit: number;
    offset: number;
    loadingData: boolean;
    totalCount: number;
    goToPage: (args: LimitOffset) => void;
    onItemPerPageChange: (args: LimitOffset) => void;
  };
}

export default class StoreknoxInventoryPendingReviewTableComponent extends Component<StoreknoxInventoryPendingReviewTableSignature> {
  @service declare intl: IntlService;

  get columns() {
    return [
      // {
      //   headerComponent: 'storeknox/table-columns/checkbox-header',
      //   cellComponent: 'storeknox/table-columns/checkbox',
      //   minWidth: 10,
      //   width: 10,
      //   textAlign: 'center',
      // },
      {
        headerComponent: 'storeknox/table-columns/store-header',
        cellComponent: 'storeknox/table-columns/store',
        minWidth: 50,
        width: 50,
        textAlign: 'center',
      },
      {
        name: this.intl.t('application'),
        cellComponent: 'storeknox/table-columns/application',
        width: 200,
      },
      {
        headerComponent:
          'storeknox/inventory/pending-review/table/requested-by-header',
        cellComponent: 'storeknox/inventory/pending-review/table/requested-by',
      },
      // {
      //   headerComponent:
      //     'storeknox/inventory/pending-review/table/availability-header',
      //   cellComponent: 'storeknox/inventory/pending-review/table/availability',
      //   textAlign: 'center',
      // },
      {
        name: this.intl.t('status'),
        cellComponent: 'storeknox/inventory/pending-review/table/status',
        textAlign: 'center',
        width: 80,
      },
    ];
  }

  get showPagination() {
    return !this.args.loadingData;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::PendingReview::Table': typeof StoreknoxInventoryPendingReviewTableComponent;
  }
}
