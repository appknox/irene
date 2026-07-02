import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type SkFakeAppInventoryModel from 'irene/models/sk-fake-app-inventory';

interface StoreknoxFakeAppsListItemCardSignature {
  Args: { skFakeApp: SkFakeAppInventoryModel };
}

export default class StoreknoxFakeAppsListItemCardComponent extends Component<StoreknoxFakeAppsListItemCardSignature> {
  @service declare router: RouterService;
  @tracked showFallback = false;

  get skApp() {
    return this.args.skFakeApp;
  }

  get lastMonitoringDate() {
    return dayjs(this.skApp.lastFakeDetectionOn).format('MMM DD, YYYY');
  }

  @action
  handleImageError() {
    this.showFallback = true;
  }

  @action
  openFakeAppDetails() {
    this.router.transitionTo(
      'authenticated.storeknox.fake-apps.fake-app-list.index',
      this.skApp.id
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::ListItemCard': typeof StoreknoxFakeAppsListItemCardComponent;
  }
}
