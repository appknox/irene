import Component from '@glimmer/component';

export default class AppMonitoringComponent extends Component {
  get settings() {
    return this.args.appMonitoring?.settings || {};
  }
}
