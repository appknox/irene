import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface StoreknoxFakeAppsOriginalAppInfoSignature {
  Args: {
    isIgnored: boolean;
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxFakeAppsOriginalAppInfoComponent extends Component<StoreknoxFakeAppsOriginalAppInfoSignature> {
  get lastMonitoredOn() {
    return dayjs(this.args.skInventoryApp?.lastFakeDetectionOn).format(
      'MMM DD, YYYY'
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::OriginalAppInfo': typeof StoreknoxFakeAppsOriginalAppInfoComponent;
  }
}
