import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type SkAppModel from 'irene/models/sk-app';

interface StoreknoxFakeAppsItemCardSignature {
  Args: { skFakeApp: SkAppModel };
}

export default class StoreknoxFakeAppsItemCardComponent extends Component<StoreknoxFakeAppsItemCardSignature> {
  @service declare router: RouterService;

  get skFakeApp() {
    return this.args.skFakeApp;
  }

  get lastMonitoringDate() {
    // TODO: Update when API returns the last monitored date
    return dayjs(this.skFakeApp.updatedOn).format('MMM DD, YYYY');
  }

  @action
  openFakeAppDetails() {
    // TODO: Remove once merged with Avi's changes
    // Should lead to storeknox.inventory.details.fake-apps route
    this.router.transitionTo(
      'authenticated.storeknox.fake-apps.details',
      1,
      126
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::ItemCard': typeof StoreknoxFakeAppsItemCardComponent;
  }
}
