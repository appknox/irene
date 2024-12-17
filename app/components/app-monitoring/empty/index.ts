import Component from '@glimmer/component';

interface AppMonitoringEmptySignature {
  Element: HTMLElement;
  Args: {
    header?: string;
    body?: string;
    isHistoryTable?: boolean;
  };
}

export default class AppMonitoringEmptyComponent extends Component<AppMonitoringEmptySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Empty': typeof AppMonitoringEmptyComponent;
  }
}
