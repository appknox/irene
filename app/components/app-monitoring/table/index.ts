import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import Store from '@ember-data/store';
import OrganizationService from 'irene/services/organization';
import RouterService from '@ember/routing/router-service';
import AmAppModel from 'irene/models/am-app';
import AMConfigurationModel from 'irene/models/amconfiguration';
import AppMonitoringService from 'irene/services/appmonitoring';
import IntlService from 'ember-intl/services/intl';

interface LimitOffset {
  limit: number;
  offset: number;
}

interface AppMonitoringTableSignature {
  Args: {
    settings: AMConfigurationModel | undefined;
  };
}

export default class AppMonitoringTableComponent extends Component<AppMonitoringTableSignature> {
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;
  @service declare appmonitoring: AppMonitoringService;
  @service declare intl: IntlService;

  get columns() {
    return [
      {
        name: this.intl.t('platform'),
        component: 'app-monitoring/table/platform',
        width: 70,
      },
      {
        name: this.intl.t('appMonitoringModule.applicationName'),
        component: 'app-monitoring/table/application',
        width: 180,
      },
      {
        name: this.intl.t('appMonitoringModule.storeVersion'),
        component: 'app-monitoring/table/store-version',
        width: 120,
      },
      {
        name: this.intl.t('appMonitoringModule.latestScannedVersion'),
        component: 'app-monitoring/table/last-scanned',
        width: 150,
      },
      {
        name: this.intl.t('status'),
        component: 'app-monitoring/table/status',
        width: 180,
      },
    ];
  }

  get monitoringData() {
    return this.appmonitoring.appMonitoringData?.toArray();
  }

  get limit() {
    return this.appmonitoring.limit;
  }

  get itemPerPageOptions() {
    return [10, 25, 50];
  }

  get offset() {
    return this.appmonitoring.offset;
  }

  get isFetchingAMTableData() {
    return this.appmonitoring.isFetchingAMData;
  }

  get hasNoOrgProjects() {
    const projectCount = this.organization?.selected?.projectsCount;

    if (projectCount) {
      return projectCount <= 0;
    }

    return true;
  }

  get tableData() {
    return this.monitoringData;
  }

  get totalCount() {
    return this.appmonitoring.appMonitoringDataCount || 0;
  }

  get isEmptyAMResult() {
    const tableDataCount = this.tableData?.length || 0;
    return tableDataCount < 1;
  }

  // Table Actions
  @action goToPage(args: LimitOffset) {
    const { limit, offset } = args;
    this.router.transitionTo('authenticated.dashboard.app-monitoring', {
      queryParams: { app_limit: limit, app_offset: offset },
    });
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { limit } = args;
    const offset = 0;

    this.router.transitionTo('authenticated.dashboard.app-monitoring', {
      queryParams: { app_limit: limit, app_offset: offset },
    });
  }

  // Drawer Actions
  @action onTableRowClick({ rowValue: amApp }: { rowValue: AmAppModel }) {
    this.router.transitionTo(
      'authenticated.dashboard.app-monitoring.monitoring-details',
      amApp.id
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Table': typeof AppMonitoringTableComponent;
  }
}
