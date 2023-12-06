import Component from '@glimmer/component';

export default class AccountSettingsDeveloperSettingsComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::DeveloperSettings': typeof AccountSettingsDeveloperSettingsComponent;
  }
}
