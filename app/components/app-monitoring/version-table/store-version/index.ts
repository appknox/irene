import Component from '@glimmer/component';
import AmAppVersionModel from 'irene/models/am-app-version';

interface AppMonitoringVersionTableStoreVersionSignature {
  Args: {
    amAppVersion: AmAppVersionModel;
  };
}

export default class AppMonitoringVersionTableStoreVersionComponent extends Component<AppMonitoringVersionTableStoreVersionSignature> {}
