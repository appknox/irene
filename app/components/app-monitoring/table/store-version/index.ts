import Component from '@glimmer/component';
import AmAppModel from 'irene/models/am-app';

interface AppMonitoringTableStatusSignature {
  Args: {
    amApp: AmAppModel;
  };
}

export default class AppMonitoringTableStoreVersionComponent extends Component<AppMonitoringTableStatusSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'app-monitoring/table/store-version': typeof AppMonitoringTableStoreVersionComponent;
  }
}
