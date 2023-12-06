import Component from '@glimmer/component';

export default class AccountSettingsGeneralComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::General': typeof AccountSettingsGeneralComponent;
  }
}
