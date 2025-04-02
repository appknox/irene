import Component from '@glimmer/component';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type MeService from 'irene/services/me';
import type OrganizationMemberModel from 'irene/models/organization-member';

export type AdminSettingsUserProductType = {
  product: 'appknox' | 'storeknox';
  title: string;
  isActive: boolean;
  role: number;
};

interface AdminSettingsUserDetailsSettingsDrawerUserProductTableComponentSignature {
  Args: {
    member?: OrganizationMemberModel;
    editProductAccess(product: AdminSettingsUserProductType): void;
  };
}

export default class AdminSettingsUserDetailsSettingsDrawerUserProductTableComponent extends Component<AdminSettingsUserDetailsSettingsDrawerUserProductTableComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  get columns() {
    return [
      {
        name: this.intl.t('product'),
        component: 'admin-settings/user-details/user-product-table/product',
      },
      {
        name: this.intl.t('productRoles'),
        component: 'admin-settings/user-details/user-product-table/role',
      },
      {
        name: this.intl.t('status'),
        component: 'admin-settings/user-details/user-product-table/action',
        textAlign: 'center',
      },
    ];
  }

  get userProductList() {
    return [
      {
        product: 'appknox',
        title: this.intl.t('appknox'),
        isActive: false,
        role: ENUMS.ORGANIZATION_ROLES.ADMIN,
      },
      {
        product: 'storeknox',
        title: this.intl.t('storeknox.title'),
        isActive: true,
        role: ENUMS.ORGANIZATION_ROLES.MEMBER,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::SettingsDrawer::UserProductTable': typeof AdminSettingsUserDetailsSettingsDrawerUserProductTableComponent;
  }
}
