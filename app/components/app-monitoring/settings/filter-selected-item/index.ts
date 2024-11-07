import Component from '@glimmer/component';

interface AppMonitoringSettingsFilterSelectedItemArgs {
  extra?: Record<string, string>;
}

export default class AppMonitoringSettingsFilterSelectedItemComponent extends Component<AppMonitoringSettingsFilterSelectedItemArgs> {
  get optionTitle() {
    return this.args.extra?.['optionTitle'];
  }

  get selectedItem() {
    return this.args.extra?.['selectedItem'];
  }

  get showLabel() {
    return this.args.extra?.['showLabel'];
  }

  get iconName() {
    return this.args.extra?.['iconName'] as string;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Settinngs::FilterSelectedItem': typeof AppMonitoringSettingsFilterSelectedItemComponent;
  }
}
