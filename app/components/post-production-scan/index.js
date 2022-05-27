import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PostProductionScanComponent extends Component {
  @tracked tableData = this.initialTableData;

  constructor(...args) {
    super(...args);
  }

  get initialTableData() {
    return this.args.model.paginatedProdScanData;
  }

  get totalTableData() {
    return this.args.model.totalProdData;
  }
}
