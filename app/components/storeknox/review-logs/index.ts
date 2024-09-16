import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

export default class StoreknoxReviewLogsComponent extends Component {
  @service declare intl: IntlService;

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.storeknox.discover.review',
        linkTitle: 'Home',
      },
      {
        route: 'authenticated.storeknox.review-logs',
        linkTitle: 'Review Logs',
      },
    ];
  }

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
        headerComponent:
          'storeknox/discover/pending-review/table/found-by-header',
        cellComponent: 'storeknox/discover/pending-review/table/found-by',
      },
      {
        name: this.intl.t('status'),
        cellComponent: 'storeknox/discover/pending-review/table/status',
        width: 80,
      },
    ];
  }

  get reviewLogApps() {
    return [
      {
        isAndroid: true,
        iconUrl:
          'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
        name: 'Shell Asia',
        packageName: 'com.shellasia.android',
        foundBy: 'Auto Discovery',
        status: 'approved',
        actionTakenBy: 'sujith',
      },
      {
        isIos: true,
        iconUrl:
          'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
        name: 'Shell Recharge India',
        packageName: 'com.shellrecharge.india',
        foundBy: 'Manual Discovery',
        status: 'approved',
        actionTakenBy: 'smit',
      },
      {
        isAndroid: true,
        iconUrl:
          'https://appknox-production-public.s3.amazonaws.com/908e507e-1148-4f4d-9939-6dba3d645abc.png',
        name: 'Shell Mobility Site Manager',
        packageName: 'com.shellmobility.ios',
        foundBy: 'Auto Discovery',
        status: 'rejected',
        actionTakenBy: 'sujith',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ReviewLogs': typeof StoreknoxReviewLogsComponent;
  }
}
