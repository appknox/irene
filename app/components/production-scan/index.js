import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ProductionScanComponent extends Component {
  @tracked offset = 1;
  @tracked limit = 5;

  get startIdx() {
    return (this.offset - 1) * this.limit;
  }

  get endIdx() {
    return this.startIdx + this.limit;
  }

  get totalProdScanData() {
    return this.args.productionScan?.totalProdScanData;
  }

  get settings() {
    return this.args.productionScan?.settings || {};
  }

  // Data to be served to production scan table
  get productionScanData() {
    const results = this.totalProdScanData.slice(this.startIdx, this.endIdx);
    return {
      count: this.totalProdScanData.length,
      results,
    };
  }

  // Mock table data update handler
  @action getTableData({ limit, offset }) {
    this.limit = limit;
    this.offset = offset;
  }
}
