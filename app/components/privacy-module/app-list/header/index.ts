import Component from '@glimmer/component';

export default class PrivacyModuleAppListHeaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Header': typeof PrivacyModuleAppListHeaderComponent;
  }
}
