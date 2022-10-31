import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class AppMonitoringTableComponent extends Component {
  @service store;
  @service organization;
  @service router;
  @service appmonitoring;

  @tracked currentAppInView = null;

  get monitoringData() {
    return this.appmonitoring.appMonitoringData;
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
    return this.organization.selected.projectsCount <= 0;
  }

  get tableData() {
    return this.monitoringData;
  }

  get totalCount() {
    return this.monitoringData?.meta?.count || 0;
  }

  get isEmptyAMResult() {
    return this.tableData.length < 1;
  }

  get showRightDrawer() {
    return !!this.currentAppInView;
  }

  // Table Actions
  @action goToPage(args) {
    const { limit, offset } = args;
    this.router.transitionTo('authenticated.app-monitoring', {
      queryParams: { app_limit: limit, app_offset: offset },
    });
  }

  @action onPageItemsCountChange(args) {
    const { limit } = args;
    const offset = 0;

    this.router.transitionTo('authenticated.app-monitoring', {
      queryParams: { app_limit: limit, app_offset: offset },
    });
  }

  // Drawer Actions
  @action onTableRowClick(amApp) {
    this.currentAppInView = amApp;
  }

  @action closeRightDrawer() {
    this.currentAppInView = null;
  }
}
