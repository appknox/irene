import Component from '@glimmer/component';

export default class PrivacyModuleAppListComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList': typeof PrivacyModuleAppListComponent;
  }
}
