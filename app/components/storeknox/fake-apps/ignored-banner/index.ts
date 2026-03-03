import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type { StoreknoxFakeAppsDetailsModel } from 'irene/routes/authenticated/storeknox/fake-apps/details';

interface StoreknoxFakeAppsIgnoredBannerSignature {
  Args: {
    fakeApp: StoreknoxFakeAppsDetailsModel;
  };
}

export default class StoreknoxFakeAppsIgnoredBannerComponent extends Component<StoreknoxFakeAppsIgnoredBannerSignature> {
  get fakeApp() {
    return this.args.fakeApp;
  }

  get isAddedToInventory() {
    return Boolean(this.fakeApp?.added_to_inventory_app);
  }

  get isFakeAppIgnored() {
    return Boolean(this.fakeApp?.reviewed_by);
  }

  get ignoredOnString() {
    return dayjs(this.fakeApp?.reviewed_on).format('MMM DD, YYYY');
  }

  get ignoredByString() {
    return this.fakeApp?.reviewed_by;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::IgnoredBanner': typeof StoreknoxFakeAppsIgnoredBannerComponent;
  }
}
