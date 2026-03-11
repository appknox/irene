import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type SkAppModel from 'irene/models/sk-app';

interface StoreknoxFakeAppsListItemCardSignature {
  Args: { skApp: SkAppModel };
}

export default class StoreknoxFakeAppsListItemCardComponent extends Component<StoreknoxFakeAppsListItemCardSignature> {
  @service declare router: RouterService;

  get skApp() {
    return this.args.skApp;
  }

  get lastMonitoringDate() {
    return dayjs(this.skApp.lastFakeDetectionOn).format('MMM DD, YYYY');
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
