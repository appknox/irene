import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import type SkThirdPartyAppsService from 'irene/services/sk-third-party-apps';
import type SkThirdPartyAppModel from 'irene/models/sk-third-party-app';
import type { StoreknoxCommonTableColumnsData } from 'irene/components/storeknox/table-columns';

export type ThirdPartyAppTableData = StoreknoxCommonTableColumnsData & {
  app: SkThirdPartyAppModel;
  score: number | null;
  riskStatus: number;
};

export default class StoreknoxThirdPartyScansTableComponent extends Component {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('sk-third-party-apps')
  declare skThirdPartyApps: SkThirdPartyAppsService;

  get isFetching() {
    return this.skThirdPartyApps.isFetching;
  }

  get totalCount() {
    return this.skThirdPartyApps.totalCount;
  }

  get hasNoApps() {
    return !this.isFetching && this.totalCount === 0;
  }

  get columns() {
    return [
      {
        headerComponent: 'storeknox/table-columns/store-header',
        cellComponent: 'storeknox/table-columns/store',
        minWidth: 80,
        width: 80,
        textAlign: 'center',
      },
      {
        name: this.intl.t('application'),
        cellComponent: 'storeknox/table-columns/application',
        width: 300,
      },
      {
        name: this.intl.t('developer'),
        cellComponent: 'storeknox/table-columns/developer',
        width: 250,
      },
      {
        name: this.intl.t('riskScore'),
        cellComponent: 'storeknox/third-party-scans/table/risk-score',
        width: 150,
      },
      {
        name: this.intl.t('riskStatus'),
        cellComponent: 'storeknox/third-party-scans/table/risk-status',
        width: 150,
      },
    ];
  }

  get tableData(): ThirdPartyAppTableData[] {
    if (this.isFetching) {
      return this.mockLoadingData;
    }

    return (
      this.skThirdPartyApps.apps?.slice().map((app) => ({
        title: app.title,
        appUrl: app.appUrl,
        iconUrl: app.iconUrl,
        name: app.title,
        packageName: app.packageName,
        isAndroid: app.isAndroid,
        isIos: app.isIos,
        devName: app.devName,
        devEmail: undefined,
        hideDevEmail: true,
        companyName: app.devName,
        reason: '',
        svg: '',
        docUlid: app.packageName,
        mailId: undefined,
        score: app.score,
        riskStatus: app.riskStatus,
        app,
      })) ?? []
    );
  }

  get mockLoadingData() {
    return Array.from(new Array(7)).map(() => ({}) as ThirdPartyAppTableData);
  }

  @action goToPage({ limit, offset }: { limit: number; offset: number }) {
    this.router.transitionTo({
      queryParams: { tp_limit: limit, tp_offset: offset },
    });
  }

  @action onItemPerPageChange({ limit }: { limit: number }) {
    this.router.transitionTo({
      queryParams: { tp_limit: limit, tp_offset: 0 },
    });
  }

  @action onRowClick(rowValue: ThirdPartyAppTableData) {
    if (!this.isFetching && rowValue.app) {
      this.router.transitionTo(
        'authenticated.storeknox.third-party-scans.app-details',
        rowValue.app.packageName,
        {
          queryParams: {
            tp_store: rowValue.app.skStore,
            tp_region: this.skThirdPartyApps.region,
          },
        }
      );
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ThirdPartyScans::Table': typeof StoreknoxThirdPartyScansTableComponent;
  }
}
