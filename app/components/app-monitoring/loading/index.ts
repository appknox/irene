import Component from '@glimmer/component';

interface AppMonitoringLoadingSignature {
  Element: HTMLElement;
  Args: {
    loadingText?: string;
  };
}

export default class AppMonitoringLoadingComponent extends Component<AppMonitoringLoadingSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Loading': typeof AppMonitoringLoadingComponent;
  }
}
