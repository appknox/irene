import Component from '@glimmer/component';

export interface SsoSettingsStepsDisplaySignature {
  Args: {
    steps: string[];
    title: string;
  };
}

export default class SsoSettingsStepsDisplayComponent extends Component<SsoSettingsStepsDisplaySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SsoSettings::StepsDisplay': typeof SsoSettingsStepsDisplayComponent;
  }
}
