// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import { action } from '@ember/object';

import AmAppModel from 'irene/models/am-app';
import AmAppVersionModel from 'irene/models/am-app-version';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import parseError from 'irene/utils/parse-error';

type AmAppVersionsModelArray =
  DS.AdapterPopulatedRecordArray<AmAppVersionModel> & {
    meta: { count: number };
  };

interface AppMonitoringVersionTableSignature {
  Args: {
    amApp: AmAppModel | null;
    isHistoryTable?: boolean;
  };
}

export default class AppMonitoringVersionTableComponent extends Component<AppMonitoringVersionTableSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked storeVersionsToDisplay: AmAppVersionModel[] = [];
  @tracked totalStoreVersions = 0;
  @tracked limit = 5;
  @tracked offset = 0;

  constructor(
    owner: unknown,
    args: AppMonitoringVersionTableSignature['Args']
  ) {
    super(owner, args);

    this.fetchAmAppVersions();
  }

  get columns() {
    return [
      this.isHistoryTable
        ? {
            name: this.intl.t('appMonitoringModule.foundOn'),
            component: 'app-monitoring/version-table/date-found',
            width: 150,
          }
        : null,
      {
        name: this.intl.t('appMonitoringModule.storeVersion'),
        component: 'app-monitoring/version-table/store-version',
        width: this.isHistoryTable ? 100 : 150,
      },
      {
        name: this.intl.t('appMonitoringModule.appStatus'),
        component: 'app-monitoring/version-table/scan-status',
        width: this.isHistoryTable ? 250 : 200,
        textAlign: 'center',
      },
      {
        name: this.intl.t('appMonitoringModule.locatedIn'),
        component: 'app-monitoring/version-table/countries',
        width: 150,
        textAlign: 'center',
      },
      {
        name: this.intl.t('action'),
        component: 'app-monitoring/version-table/actions',
        headerComponent: 'app-monitoring/version-table/actions-header',
        width: 150,
        textAlign: 'center',
      },
    ].filter(Boolean);
  }

  get amApp() {
    return this.args.amApp;
  }

  get isHistoryTable() {
    return this.args.isHistoryTable;
  }

  get showPagination() {
    return this.isHistoryTable && this.totalStoreVersions > 5;
  }

  get noVersionsFoundMsg() {
    if (this.isHistoryTable) {
      return this.intl.t('appMonitoringMessages.monitoringHistoryEmpty.body');
    }

    return this.intl.t('appMonitoringMessages.monitoringDetailsEmpty.body');
  }

  get hasNoStoreVersions() {
    return this.storeVersionsToDisplay.length < 1;
  }

  get showPendingStateLoader() {
    return (
      this.hasNoStoreVersions && this.amApp?.isPending && this.amApp.isActive
    );
  }

  // Table Actions
  @action goToPage({ limit, offset }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = offset;

    this.fetchAmAppVersions();
  }

  @action onItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = 0;

    this.fetchAmAppVersions();
  }

  @action fetchAmAppVersions() {
    this.fetchLiveAmAppVersions.perform();
  }

  fetchLiveAmAppVersions = task(async () => {
    const amAppId = this.amApp?.id;
    const query = this.isHistoryTable
      ? {
          limit: this.limit,
          offset: this.offset,
        }
      : {};

    try {
      const amAppVersions = (await this.store.query('am-app-version', {
        amAppId,
        live: !this.isHistoryTable,
        ...query,
      })) as AmAppVersionsModelArray;

      this.totalStoreVersions = amAppVersions.meta.count;
      this.storeVersionsToDisplay = amAppVersions.toArray();
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::VersionTable': typeof AppMonitoringVersionTableComponent;
  }
}
