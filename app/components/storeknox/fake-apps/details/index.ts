import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import type Store from 'ember-data/store';

import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface StoreknoxFakeAppsDetailsSignature {
  Args: { fakeApp: SkFakeAppModel };
}

export default class StoreknoxFakeAppsDetailsComponent extends Component<StoreknoxFakeAppsDetailsSignature> {
  @service declare store: Store;

  @tracked showIgnoreDrawer = false;
  @tracked addToInventory = false;
  @tracked skInventoryAppForFakeApp?: SkInventoryAppModel | null = null;

  constructor(owner: unknown, args: StoreknoxFakeAppsDetailsSignature['Args']) {
    super(owner, args);

    this.fetchSkInventoryApp.perform();
  }

  get isFakeAppIgnored(): boolean {
    return Boolean(this.args.fakeApp?.reviewedBy);
  }

  @action
  openIgnoreDrawer(addToInventory = false) {
    this.addToInventory = addToInventory;
    this.showIgnoreDrawer = true;
  }

  @action
  closeIgnoreDrawer() {
    this.showIgnoreDrawer = false;
    this.addToInventory = false;
  }

  fetchSkInventoryApp = task({ keepLatest: true }, async () => {
    const skInventoryApp = await this.store.findRecord(
      'sk-inventory-app',
      String(this.args.fakeApp.skApp.get('id'))
    );

    this.skInventoryAppForFakeApp = skInventoryApp;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::Details': typeof StoreknoxFakeAppsDetailsComponent;
  }
}
