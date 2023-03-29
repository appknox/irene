import Component from '@glimmer/component';

interface AppMonitoringEmptySignature {
  Element: HTMLDivElement;
  Args: {
    header?: string;
    body?: string;
  };
}

export default class AppMonitoringEmptyComponent extends Component<AppMonitoringEmptySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Empty': typeof AppMonitoringEmptyComponent;
    'app-monitoring/empty': typeof AppMonitoringEmptyComponent;
  }
}
