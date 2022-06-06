import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class ProductionScanTableComponent extends Component {
  constructor(...args) {
    super(...args);
  }

  get tableData() {
    return this.args.prodScanTableData.results;
  }
  get totalCount() {
    return this.args.prodScanTableData.count;
  }

  get showProdScanTableData() {
    return this.args.settings?.enabled && this.tableData.length > 0;
  }

  get isEmptyProdScanResult() {
    return this.args.settings?.enabled && this.tableData.length < 1;
  }

  @action goToPage(args) {
    const { selectedItemsPerPage: limit, offset } = args;
    this.getProdScanTableData({ limit, offset });
  }

  @action getPage(args) {
    const { selectedItemsPerPage: limit } = args;
    this.getProdScanTableData({ limit, offset: 1 });
  }

  @action getProdScanTableData({ limit = 9, offset = 1 }) {
    this.args.updateTableData({ limit, offset });
  }
}
