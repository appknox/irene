import Component from '@glimmer/component';

export interface SsoSettingsWarningBannerSignature {
  Args: {
    text: string;
  };
}

export default class SsoSettingsWarningBannerComponent extends Component<SsoSettingsWarningBannerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SsoSettings::WarningBanner': typeof SsoSettingsWarningBannerComponent;
  }
}
