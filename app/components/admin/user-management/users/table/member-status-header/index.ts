import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';

export default class AdminUserManagementUsersTableMemberStatusHeaderComponent extends Component {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked selectedStatus: number = -1;
  @tracked filterApplied: boolean = false;

  @action
  handleClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleOptionsClose() {
    this.anchorRef = null;
  }

  @action
  selectStatus(value: number) {
    this.selectedStatus = value;

    this.filterApplied = value > -1;

    this.anchorRef = null;
  }

  @action
  clearFilter() {
    this.selectedStatus = -1;

    this.filterApplied = false;

    this.anchorRef = null;
  }

  get statusObject() {
    return [
      {
        key: this.intl.t('all'),
        value: -1,
      },
      {
        key: this.intl.t('activeCapital'),
        value: ENUMS.MEMBER_STATUS.ACTIVE,
      },
      {
        key: this.intl.t('deactivated'),
        value: ENUMS.MEMBER_STATUS.DEACTIVATED,
      },
      {
        key: this.intl.t('pending'),
        value: ENUMS.MEMBER_STATUS.PENDING,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::UserManagement::Users::Table::MemberStatusHeader': typeof AdminUserManagementUsersTableMemberStatusHeaderComponent;
  }
}
