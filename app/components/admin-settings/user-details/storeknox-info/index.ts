import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import { userRole } from 'irene/helpers/user-role';
import type OrganizationMemberModel from 'irene/models/organization-member';

interface AdminSettingsUserDetailsStoreknoxInfoSignature {
  Element: HTMLElement;
  Args: {
    member?: OrganizationMemberModel;
  };
}

export default class AdminSettingsUserDetailsStoreknoxInfoComponent extends Component<AdminSettingsUserDetailsStoreknoxInfoSignature> {
  @service declare intl: IntlService;

  get member() {
    return this.args.member;
  }

  get memberIsDeactivated() {
    return !this.member?.member.get('isActive');
  }

  get userDetailsSections() {
    return [
      {
        title: `${this.intl.t('storeknox.title')} ${this.intl.t('role')}`,
        value: this.intl.t(userRole([Number(this.member?.role)])),
      },
      {
        title: 'Joined On',
        value: dayjs(this.member?.createdOn).format('MMM DD, YYYY, HH:mm'),
      },
      {
        title: 'Last Accessed On',
        value: dayjs(this.member?.lastLoggedIn).format('MMM DD, YYYY, HH:mm'),
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::StoreknoxInfo': typeof AdminSettingsUserDetailsStoreknoxInfoComponent;
  }
}
