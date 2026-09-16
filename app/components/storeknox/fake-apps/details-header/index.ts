import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';

import type IntlService from 'ember-intl/services/intl';
import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface StoreknoxFakeAppsDetailsHeaderSignature {
  Args: {
    fakeApp: SkFakeAppModel;
    skInventoryApp?: SkInventoryAppModel;
    isFakeAppIgnored: boolean;
  };
}

export default class StoreknoxFakeAppsDetailsHeaderComponent extends Component<StoreknoxFakeAppsDetailsHeaderSignature> {
  @service declare intl: IntlService;

  @tracked addToInventory = false;
  @tracked showIgnoreDrawer = false;
  @tracked showFallback = false;

  get fakeApp() {
    return this.args.fakeApp;
  }

  get isFakeAppIgnored() {
    return this.args.isFakeAppIgnored;
  }

  // Deliberately narrower than the model's `isReadOnly` (isArchived ||
  // isDecommissioned): this page has never guarded archived apps, and
  // widening to isReadOnly would newly disable actions for them. Only the
  // decommissioned case is in scope for this lock -- see sk-app.ts's
  // isReadOnly doc comment for the "tell the two states apart" guidance.
  get appIsDecommissioned() {
    return Boolean(this.args.skInventoryApp?.isDecommissioned);
  }

  get isAndroid() {
    return this.fakeApp?.isAndroid;
  }

  get isIos() {
    return this.fakeApp?.isIos;
  }

  get isApkModyOrAptoideStore() {
    return this.fakeApp?.isApkModyStore || this.fakeApp?.isAptoideStore;
  }

  get addToInventoryDisabled() {
    return this.appIsDecommissioned || this.isApkModyOrAptoideStore;
  }

  get addToInventoryTooltipTitle() {
    if (this.appIsDecommissioned) {
      return this.intl.t('storeknox.decommissionedActionDisabled');
    }

    return this.intl.t(
      'storeknox.fakeApps.cannotIgnoreNonAppStoreAndPlayStoreApps'
    );
  }

  get isBrandAbuseFakeApp() {
    return this.fakeApp?.isBrandAbuse;
  }

  get isFakeApp() {
    return this.fakeApp?.isFakeApp;
  }

  get headerTitle() {
    return this.intl.t(
      this.isBrandAbuseFakeApp
        ? 'storeknox.brandAbuse'
        : 'storeknox.fakeApps.fakeApp'
    );
  }

  get storeIconComponent() {
    if (this.fakeApp.isAndroidStore) {
      return 'ak-svg/playstore-logo';
    }

    if (this.fakeApp.isAptoideStore) {
      return 'ak-svg/apptoide-icon';
    }

    return 'ak-svg/appstore-logo';
  }

  @action
  handleImageError() {
    this.showFallback = true;
  }

  @action
  openIgnoreDrawer(addToInventory = false) {
    if (this.appIsDecommissioned) {
      return;
    }

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
