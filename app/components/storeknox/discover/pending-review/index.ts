import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

export default class StoreknoxDiscoverPendingReviewComponent extends Component {
  @service declare intl: IntlService;

  @tracked searchQuery = '';
  @tracked discoverClicked = false;
  @tracked pendingItems = true;

  @action
  discoverApp() {
    this.searchQuery = 'Shell Test';
    this.discoverClicked = true;
  }

  @action
  clearSearch() {
    this.searchQuery = '';
    this.discoverClicked = false;
  }

  get columns() {
    return [
      {
        headerComponent: 'storeknox/table-columns/checkbox-header',
        cellComponent: 'storeknox/table-columns/checkbox',
        minWidth: 10,
        width: 10,
        textAlign: 'center',
      },
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
          'storeknox/discover/pending-review/table/found-by-header',
        cellComponent: 'storeknox/discover/pending-review/table/found-by',
      },
      {
        headerComponent:
          'storeknox/discover/pending-review/table/availability-header',
        cellComponent: 'storeknox/discover/pending-review/table/availability',
        textAlign: 'center',
      },
      {
        name: this.intl.t('status'),
        cellComponent: 'storeknox/discover/pending-review/table/status',
        textAlign: 'center',
        width: 80,
      },
    ];
  }

  get reviewApps() {
    return [
      {
        isAndroid: true,
        iconUrl:
          'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
        name: 'Shell Asia',
        packageName: 'com.shellasia.android',
        foundBy: 'Auto Discovery',
        available: 'VAPT',
      },
      {
        isIos: true,
        iconUrl:
          'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
        name: 'Shell Recharge India',
        packageName: 'com.shellrecharge.india',
        foundBy: 'Manual Discovery',
        mailId: 'smit@appknox.com',
        available: null,
      },
      {
        isAndroid: true,
        iconUrl:
          'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
        name: 'Shell Mobility Site Manager',
        packageName: 'com.shellmobility.ios',
        foundBy: 'Auto Discovery',
        available: 'SM',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::PendingReview': typeof StoreknoxDiscoverPendingReviewComponent;
  }
}
