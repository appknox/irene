import Component from '@glimmer/component';

export interface AccountSettingsPageContentWrapperSignature {
  Element: HTMLDivElement;
  Blocks: { default: [] };
}

export default class AccountSettingsPageContentWrapperComponent extends Component<AccountSettingsPageContentWrapperSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::PageContentWrapper': typeof AccountSettingsPageContentWrapperComponent;
  }
}
