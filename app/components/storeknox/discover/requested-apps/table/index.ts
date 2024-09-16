import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import IntlService from 'ember-intl/services/intl';

interface LimitOffset {
  limit: number;
  offset: number;
}

export default class StoreknoxDiscoverRequestedAppsTableComponent extends Component {
  @service declare router: RouterService;
  @service declare intl: IntlService;

  @tracked requestedApps = [
    {
      isAndroid: true,
      iconUrl:
        'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
      name: 'Shell Asia',
      packageName: 'com.shellasia.android',
      companyName: 'Shell Information Technology International',
      mailId: 'asiashell@shell.com',
      status: 'pending',
    },
    {
      isAndroid: true,
      iconUrl:
        'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
      name: 'Shell Recharge India',
      packageName: 'com.shellrecharge.india',
      companyName: 'Shell Information Technology International',
      mailId: null,
      status: 'approved',
      actionTakenBy: 'subho',
    },
    {
      isIos: true,
      iconUrl:
        'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
      name: 'Shell Mobility Site Manager',
      packageName: 'com.shellmobility.ios',
      companyName: 'Shell Information Technology International',
      mailId: null,
      requested: true,
      status: 'rejected',
      actionTakenBy: 'subho',
    },
  ];

  // Table Actions
  @action goToPage(args: LimitOffset) {
    const { limit, offset } = args;
    this.router.transitionTo('authenticated.storeknox.discover.requested', {
      queryParams: { app_limit: limit, app_offset: offset },
    });
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { limit } = args;
    const offset = 0;

    this.router.transitionTo('authenticated.storeknox.discover.requested', {
      queryParams: { app_limit: limit, app_offset: offset },
    });
  }

  get totalCount() {
    return this.requestedApps.length || 0;
  }

  get tableData() {
    return this.requestedApps;
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

  get columns() {
    return [
      {
        headerComponent: 'storeknox/table-columns/store-header',
        cellComponent: 'storeknox/table-columns/store',
        minWidth: 30,
        width: 30,
        textAlign: 'center',
      },
      {
        name: this.intl.t('application'),
        cellComponent: 'storeknox/table-columns/application',
      },
      {
        name: this.intl.t('developer'),
        cellComponent: 'storeknox/table-columns/developer',
      },
      {
        name: this.intl.t('status'),
        cellComponent: 'storeknox/discover/requested-apps/table/status',
        width: 80,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::RequestedApps::Table': typeof StoreknoxDiscoverRequestedAppsTableComponent;
  }
}
