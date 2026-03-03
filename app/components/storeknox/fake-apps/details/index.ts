import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type { StoreknoxFakeAppsDetailsModel } from 'irene/routes/authenticated/storeknox/fake-apps/details';

export interface StoreknoxFakeAppsDetailsSignature {
  Args: { fakeApp: StoreknoxFakeAppsDetailsModel };
}

export default class StoreknoxFakeAppsDetailsComponent extends Component<StoreknoxFakeAppsDetailsSignature> {
  @tracked showIgnoreDrawer = false;

  get isFakeAppIgnored(): boolean {
    return Boolean(this.args.fakeApp?.reviewed_by);
  }

  @action
  openIgnoreDrawer() {
    this.showIgnoreDrawer = true;
  }

  @action
  closeIgnoreDrawer() {
    this.showIgnoreDrawer = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::Details': typeof StoreknoxFakeAppsDetailsComponent;
  }
}
