import Component from '@glimmer/component';

export interface SystemStatusStatusComponentSignature {
  Args: {
    isRunning: boolean;
    isWorking: boolean;
    message?: string;
  };
  Element: HTMLElement;
}

export default class SystemStatusStatusComponent extends Component<SystemStatusStatusComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SystemStatus::Status': typeof SystemStatusStatusComponent;
  }
}
