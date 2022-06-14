import Component from '@glimmer/component';

export default class ProductionScanTableStatusComponent extends Component {
  get status() {
    return this.args.status?.split('-').join(' ');
  }
}
