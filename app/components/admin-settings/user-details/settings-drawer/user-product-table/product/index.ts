import Component from '@glimmer/component';
import type { AdminSettingsUserProductType } from '..';

interface AdminSettingsUserDetailsUserProductTableProductSignatureComponent {
  Element: HTMLDivElement;
  Args: {
    product: AdminSettingsUserProductType;
  };
}

export default class AdminSettingsUserDetailsUserProductTableProductComponent extends Component<AdminSettingsUserDetailsUserProductTableProductSignatureComponent> {
  productInfoIconMap = {
    appknox: 'ak-svg/vapt-indicator' as const,
    storeknox: 'ak-svg/sox-icon' as const,
  };
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::UserProductTable::Product': typeof AdminSettingsUserDetailsUserProductTableProductComponent;
    'admin-settings/user-details/user-product-table/product': typeof AdminSettingsUserDetailsUserProductTableProductComponent;
  }
}
