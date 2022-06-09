import Component from '@glimmer/component';

export default class ProductionScanComponent extends Component {
  get settings() {
    return this.args.productionScan?.settings || {};
  }
}
