import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type SkFakeAppModel from 'irene/models/sk-fake-app';

interface StoreknoxFakeAppsIgnoredBannerSignature {
  Args: { fakeApp: SkFakeAppModel | null };
}

export default class StoreknoxFakeAppsIgnoredBannerComponent extends Component<StoreknoxFakeAppsIgnoredBannerSignature> {
  get fakeApp() {
    return this.args.fakeApp;
  }

  get isAddedToInventory() {
    return Boolean(this.fakeApp?.addedToInventoryApp);
  }

  get isFakeAppIgnored() {
    return Boolean(this.fakeApp?.reviewedBy);
  }

  get ignoredOnString() {
    return dayjs(this.fakeApp?.reviewedOn).format('MMM DD, YYYY');
  }

  get ignoredByString() {
    return this.fakeApp?.reviewedBy ?? '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::IgnoredBanner': typeof StoreknoxFakeAppsIgnoredBannerComponent;
  }
}
