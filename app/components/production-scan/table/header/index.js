import Component from '@glimmer/component';

export default class ProductionScanTableHeaderComponent extends Component {
  constructor(...args) {
    super(...args);
  }

  get tableHeaders() {
    return [
      'Platform',
      'Application Name',
      'Version in Production',
      'Last Scanned Version',
      'Status',
    ];
  }
}
