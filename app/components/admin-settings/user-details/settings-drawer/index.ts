import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import type IntlService from 'ember-intl/services/intl';
import type OrganizationMemberModel from 'irene/models/organization-member';
import { AdminSettingsUserProductType } from '../user-product-table';

type ProductTypes = 'appknox' | 'storeknox';

interface AdminSettingsUserDetailsSettingsDrawerComponentSignature {
  Args: {
    member?: OrganizationMemberModel;
    showSettingsDrawer: boolean;
    closeSettingsDrawer(): void;
  };
}

export default class AdminSettingsUserDetailsSettingsDrawerComponent extends Component<AdminSettingsUserDetailsSettingsDrawerComponentSignature> {
  @service declare intl: IntlService;

  @tracked showProductStatusTogglePrompt = false;
  @tracked isActivateAction = false;
  @tracked productToActivateOrDeactivate: ProductTypes | null = null;

  get productTitleMap() {
    return {
      appknox: this.intl.t('appknox'),
      storeknox: this.intl.t('storeknox.title'),
    };
  }

  get productsStatus() {
    return { appknox: false, storeknox: true };
  }

  get allProductInActive() {
    return Object.values(this.productsStatus).every((st) => !st);
  }

  get allProductActive() {
    return !this.allProductInActive;
  }

  get oneProductActive() {
    return Object.values(this.productsStatus).some(Boolean);
  }

  get statusToggleSectionMsgs() {
    return {
      headerSubtext: this.allProductInActive
        ? 'Activate both the access of Appknox and Storeknox'
        : 'Deactivate both the access of Appknox and Storeknox',

      btnTitle: this.oneProductActive
        ? this.intl.t('deactivateUser')
        : this.intl.t('activateUser'),
    };
  }

  get productStatusToggleMsg() {
    return {
      actionTerm:
        this.allProductInActive || this.isActivateAction
          ? 'activate'
          : 'deactivate',

      actionTermCapital:
        this.allProductInActive || this.isActivateAction
          ? 'Activate'
          : 'Deactivate',

      msgSuffix: this.productToActivateOrDeactivate
        ? `for ${this.productTitleMap[this.productToActivateOrDeactivate]}?`
        : 'for both Appknox and Storeknox?',
    };
  }

  @action resetEditState() {
    this.showProductStatusTogglePrompt = false;
    this.productToActivateOrDeactivate = null;
    this.isActivateAction = false;
  }

  @action editProductAccess(product: AdminSettingsUserProductType) {
    this.showProductStatusTogglePrompt = true;
    this.productToActivateOrDeactivate = product.product;
    this.isActivateAction = !product.isActive;
  }

  @action deactivateOrActivateAllProducts() {
    this.showProductStatusTogglePrompt = true;
  }

  @action closeSettingsDrawer() {
    this.resetEditState();
    this.args.closeSettingsDrawer();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::SettingsDrawer': typeof AdminSettingsUserDetailsSettingsDrawerComponent;
  }
}
