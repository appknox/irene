import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import { userRole } from 'irene/helpers/user-role';
import type OrganizationMemberModel from 'irene/models/organization-member';
import type OrganizationService from 'irene/services/organization';

interface AdminSettingsUserDetailsAppknoxInfoSignature {
  Element: HTMLElement;
  Args: {
    member?: OrganizationMemberModel;
  };
}

export default class AdminSettingsUserDetailsAppknoxInfoComponent extends Component<AdminSettingsUserDetailsAppknoxInfoSignature> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;

  get member() {
    return this.args.member;
  }

  get memberIsDeactivated() {
    return !this.member?.member.get('isActive');
  }

  get userDetailsSections() {
    return [
      {
        title: `${this.intl.t('appknox')} ${this.intl.t('role')}`,
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
    'AdminSettings::UserDetails::AppknoxInfo': typeof AdminSettingsUserDetailsAppknoxInfoComponent;
  }
}
