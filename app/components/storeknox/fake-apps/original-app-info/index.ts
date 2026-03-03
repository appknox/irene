import Component from '@glimmer/component';
import type { StoreknoxFakeAppsDetailsModel } from 'irene/routes/authenticated/storeknox/fake-apps/details';

export interface StoreknoxFakeAppsOriginalAppInfoSignature {
  Args: { isIgnored: boolean; fakeApp: StoreknoxFakeAppsDetailsModel };
}

export default class StoreknoxFakeAppsOriginalAppInfoComponent extends Component<StoreknoxFakeAppsOriginalAppInfoSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::OriginalAppInfo': typeof StoreknoxFakeAppsOriginalAppInfoComponent;
  }
}
