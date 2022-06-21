import Component from '@glimmer/component';

export default class AppMonitoringTableHeaderComponent extends Component {
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
