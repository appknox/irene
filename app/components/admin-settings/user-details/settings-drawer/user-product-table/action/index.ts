import Component from '@glimmer/component';
import type { AdminSettingsUserProductType } from '..';

interface AdminSettingsUserDetailsUserProductTableActionSignatureComponent {
  Element: HTMLDivElement;
  Args: {
    product: AdminSettingsUserProductType;
    editProductAccess(product: AdminSettingsUserProductType): void;
  };
}

export default class AdminSettingsUserDetailsUserProductTableActionComponent extends Component<AdminSettingsUserDetailsUserProductTableActionSignatureComponent> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::UserProductTable::Action': typeof AdminSettingsUserDetailsUserProductTableActionComponent;
    'admin-settings/user-details/user-product-table/action': typeof AdminSettingsUserDetailsUserProductTableActionComponent;
  }
}
