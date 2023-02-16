import Component from '@glimmer/component';
import { AppMonitoringRouteModel } from 'irene/routes/authenticated/app-monitoring';

interface AppMonitoringSignature {
  Args: {
    appMonitoring: AppMonitoringRouteModel;
  };
}

export default class AppMonitoringComponent extends Component<AppMonitoringSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AppMonitoring: typeof AppMonitoringComponent;
  }
}
