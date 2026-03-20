import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';

import type IntlService from 'ember-intl/services/intl';
import type SkFakeAppModel from 'irene/models/sk-fake-app';

export interface StoreknoxFakeAppsDetailsHeaderSignature {
  Args: {
    fakeApp: SkFakeAppModel;
    isFakeAppIgnored: boolean;
  };
}

export default class StoreknoxFakeAppsDetailsHeaderComponent extends Component<StoreknoxFakeAppsDetailsHeaderSignature> {
  @service declare intl: IntlService;

  @tracked addToInventory = false;
  @tracked showIgnoreDrawer = false;
  @tracked showFallback = false;

  get isFakeAppIgnored() {
    return this.args.isFakeAppIgnored;
  }

  get isAndroid() {
    return this.args.fakeApp?.isAndroid;
  }

  get isBrandAbuseFakeApp() {
    return this.args.fakeApp?.isBrandAbuse;
  }

  get isFakeApp() {
    return this.args.fakeApp?.isFakeApp;
  }

  get headerTitle() {
    return this.intl.t(
      this.isBrandAbuseFakeApp
        ? 'storeknox.brandAbuse'
        : 'storeknox.fakeApps.fakeApp'
    );
  }

  @action
  handleImageError() {
    this.showFallback = true;
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::DetailsHeader': typeof StoreknoxFakeAppsDetailsHeaderComponent;
  }
}
