import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';

interface LimitOffset {
  limit: number;
  offset: number;
}

export default class StoreknoxInventoryAppListTableComponent extends Component {
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare me: MeService;

  @tracked searchResults = [
    {
      isAndroid: true,
      iconUrl:
        'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
      name: 'Shell Asia',
      packageName: 'com.shellasia.android',
      companyName: 'Shell Information Technology International',
      mailId: 'asiashell@shell.com',
      reason: 'Unscanned versions, brand abuse and duplications',
      svg: 'ak-svg/vapt-indicator',
    },
    {
      isAndroid: true,
      iconUrl:
        'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
      name: 'Shell Recharge India',
      packageName: 'com.shellrecharge.india',
      companyName: 'Shell Information Technology International',
      reason: 'Unscanned versions and duplications',
      svg: 'ak-svg/sm-indicator',
    },
    {
      isIos: true,
      iconUrl:
        'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
      name: 'Shell Mobility Site Manager',
      packageName: 'com.shellmobility.ios',
      companyName: 'Shell Information Technology International',
      reason: 'Unscanned versions',
      svg: 'ak-svg/info-indicator',
    },
  ];

  get columns() {
    return [
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
        name: this.intl.t('developer'),
        cellComponent: 'storeknox/table-columns/developer',
        width: 200,
      },
      {
        name: 'Monitoring Status',
        cellComponent: 'storeknox/inventory/app-list/table/monitoring-status',
        width: 200,
      },
      {
        headerComponent:
          'storeknox/inventory/app-list/table/availability-header',
        cellComponent: 'storeknox/inventory/app-list/table/availability',
        textAlign: 'center',
      },
    ];
  }

  // Table Actions
  @action goToPage(args: LimitOffset) {
    const { limit, offset } = args;
    this.router.transitionTo('authenticated.storeknox.inventory.app-list', {
      queryParams: { app_limit: limit, app_offset: offset },
    });
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { limit } = args;
    const offset = 0;

    this.router.transitionTo('authenticated.storeknox.inventory.app-list', {
      queryParams: { app_limit: limit, app_offset: offset },
    });
  }

  get totalCount() {
    return this.searchResults.length || 0;
  }

  get tableData() {
    return this.searchResults;
  }

  get itemPerPageOptions() {
    return [10, 25, 50];
  }

  get limit() {
    return 10;
  }

  get offset() {
    return 0;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::AppList::Table': typeof StoreknoxInventoryAppListTableComponent;
  }
}
