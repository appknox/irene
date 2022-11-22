import Component from '@glimmer/component';

export default class AppMonitoringTableHeaderComponent extends Component {
  get tableHeaders() {
    return [
      'Platform',
      'Application Name',
      'Store Version ',
      'Latest Scanned Version',
      'Status',
    ];
  }
}
