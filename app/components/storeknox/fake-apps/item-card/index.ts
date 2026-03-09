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
    return dayjs(this.skFakeApp.lastFakeDetectionOn).format('MMM DD, YYYY');
  }

  @action
  openFakeAppDetails() {
    this.router.transitionTo(
      'authenticated.storeknox.inventory-details.fake-app-list.index',
      this.skFakeApp.id
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::ItemCard': typeof StoreknoxFakeAppsItemCardComponent;
  }
}
