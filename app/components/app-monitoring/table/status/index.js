import Component from '@glimmer/component';

export default class AppMonitoringTableStatusComponent extends Component {
  constructor(...args) {
    super(...args);
  }

  get amApp() {
    return this.args.amApp;
  }

  get status() {
    if (this.args.columnName === 'storeVersion') {
      if (this.amApp.isPending) {
        return 'pending';
      } else if (this.amApp.isNotFound) {
        return 'not-found';
      }
      return '';
    } else {
      if (!this.amApp?.monitoringEnabled || !this.args.settings?.enabled) {
        return 'inactive';
      }
      return 'active';
    }
  }

  get formattedStatus() {
    return this.status?.split('-')?.join(' ');
  }
}
