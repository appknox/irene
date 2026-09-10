import Component from '@glimmer/component';

export interface AccountSettingsCyodSettingsStepSignature {
  Element: HTMLElement;

  Args: {
    number: string;
    title: string;
  };

  Blocks: {
    default: [];
  };
}

export default class AccountSettingsCyodSettingsStepComponent extends Component<AccountSettingsCyodSettingsStepSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::CyodSettings::Step': typeof AccountSettingsCyodSettingsStepComponent;
    'account-settings/cyod-settings/step': typeof AccountSettingsCyodSettingsStepComponent;
  }
}
