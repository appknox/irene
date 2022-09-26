import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class AppMonitoringTableComponent extends Component {
  @service store;
  @service organization;

  itemPerPageOptions = [10, 25, 50];

  @tracked monitoringData = [];
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked currentAppInView = null;

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
  @action fetchProdscanData() {
    this.fetchTableData.perform();
  }

  @action getAMTableData({ limit = this.itemPerPageOptions[0], offset = 0 }) {
    this.limit = limit;
    this.offset = offset;
    this.fetchProdscanData();
  }

  @action goToPage(args) {
    const { limit, offset } = args;
    this.getAMTableData({ limit, offset });
  }

  @action onPageItemsCountChange(args) {
    const { limit } = args;
    this.getAMTableData({ limit, offset: 0 });
  }

  // Drawer Actions
  @action onTableRowClick(amApp) {
    this.currentAppInView = amApp;
  }

  @action closeRightDrawer() {
    this.currentAppInView = null;
  }

  @task(function* () {
    const monitoringData = yield this.store.query('am-app', {
      limit: this.limit,
      offset: this.offset,
    });
    this.monitoringData = monitoringData;
  })
  fetchTableData;
}
