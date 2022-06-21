import Component from '@glimmer/component';

export default class AppMonitoringTableStatusComponent extends Component {
  get status() {
    return this.args.status?.split('-')?.join(' ');
  }
}
