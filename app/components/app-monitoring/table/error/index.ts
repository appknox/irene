import Component from '@glimmer/component';

interface AppMonitoringTableErrorSignature {
  Args: {
    header?: string;
    body?: string;
  };
}

export default class AppMonitoringTableErrorComponent extends Component<AppMonitoringTableErrorSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Table::Error': typeof AppMonitoringTableErrorComponent;
    'app-monitoring/table/error': typeof AppMonitoringTableErrorComponent;
  }
}
