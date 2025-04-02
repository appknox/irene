import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type MeService from 'irene/services/me';
import type { AdminSettingsUserProductType } from '..';

interface AdminSettingsUserDetailsUserProductTableRoleSignatureComponent {
  Element: HTMLDivElement;

  Args: {
    product: AdminSettingsUserProductType;
  };
}

export default class AdminSettingsUserDetailsUserProductTableRoleComponent extends Component<AdminSettingsUserDetailsUserProductTableRoleSignatureComponent> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

  roles = ENUMS.ORGANIZATION_ROLES.CHOICES.slice(0, -1);

  get product() {
    return this.args.product;
  }

  get userDisabled() {
    return !this.product?.isActive;
  }

  get selectedRole() {
    return this.roles.find((r) => r.value === this.product.role);
  }

  get roleIsAdminOrOwner() {
    return [
      ENUMS.ORGANIZATION_ROLES.ADMIN,
      ENUMS.ORGANIZATION_ROLES.OWNER,
    ].includes(Number(this.selectedRole?.value));
  }

  /* Change member role */
  selectMemberRole = task(async ({ value: role }) => {
    console.log(role);

    // const member = this.args.member;
    // member?.set('role', role);
    // member
    //   ?.save()
    //   .then(() => {
    //     this.notify.success(this.intl.t('userRoleUpdated'));
    //   })
    //   .catch((err) => {
    //     let errMsg = this.intl.t('pleaseTryAgain');
    //     if (err.errors && err.errors.length) {
    //       errMsg = err?.errors[0]?.detail || errMsg;
    //     } else if (err.message) {
    //       errMsg = err.message;
    //     }
    //     this.notify.error(errMsg);
    //   });
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::UserProductTable::Role': typeof AdminSettingsUserDetailsUserProductTableRoleComponent;
    'admin-settings/user-details/user-product-table/role': typeof AdminSettingsUserDetailsUserProductTableRoleComponent;
  }
}
