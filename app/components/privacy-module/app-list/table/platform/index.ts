import Component from '@glimmer/component';
import ENUMS from 'irene/enums';

interface PrivacyModuleAppListTablePlatformArgs {
  privacyApp: { platform: number };
}

export default class PrivacyModuleAppListTablePlatformComponent extends Component<PrivacyModuleAppListTablePlatformArgs> {
  get platform() {
    return this.args.privacyApp.platform;
  }

  get platformIconClass() {
    switch (this.platform) {
      case ENUMS.PLATFORM.ANDROID:
        return 'android';
      case ENUMS.PLATFORM.IOS:
        return 'apple';
      case ENUMS.PLATFORM.WINDOWS:
        return 'windows';
      default:
        return 'mobile';
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Table::Platform': typeof PrivacyModuleAppListTablePlatformComponent;
  }
}
