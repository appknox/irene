import Component from '@glimmer/component';
import AmAppVersionModel from 'irene/models/am-app-version';

interface AppMonitoringVersionTableActionsSignature {
  Args: {
    amAppVersion: AmAppVersionModel;
  };
}

export default class AppMonitoringVersionTableActionsComponent extends Component<AppMonitoringVersionTableActionsSignature> {
  get amAppVersion() {
    return this.args.amAppVersion;
  }

  get isScanned() {
    return this.amAppVersion.get('latestFile').get('id');
  }
}
