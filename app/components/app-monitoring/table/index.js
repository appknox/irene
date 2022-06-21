import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class AppMonitoringTableComponent extends Component {
  @service store;

  itemPerPageOptions = [1, 2, 3, 5];

  @tracked monitoring_data = [];
  @tracked limit = 1;
  @tracked offset = 0;

  constructor(...args) {
    super(...args);
  }

  get tableData() {
    return this.monitoring_data;
  }

  get totalCount() {
    return this.monitoring_data?.meta?.count || 0;
  }

  get showProdScanTableData() {
    return this.args.settings?.enabled;
  }

  get isDisabled() {
    return !this.args.settings?.enabled;
  }

  get isEmptyProdScanResult() {
    return this.args.settings?.enabled && this.tableData.length < 1;
  }

  @action goToPage(args) {
    const { limit, offset } = args;
    this.getProdScanTableData({ limit, offset });
  }

  @action getPage(args) {
    const { limit } = args;
    this.getProdScanTableData({ limit, offset: 0 });
  }

  @action getProdScanTableData({ limit = 9, offset = 1 }) {
    this.limit = limit;
    this.offset = offset;
    this.fetchProdscanData();
  }

  @action fetchProdscanData() {
    this.fetchTableData.perform();
  }

  @task(function* () {
    try {
      const monitoring_data = yield this.store.query('app-monitoring/am-app', {
        limit: this.limit,
        offset: this.offset,
      });
      this.monitoring_data = monitoring_data;
    } catch (error) {
      console.log(error);
    }
  })
  fetchTableData;
}
