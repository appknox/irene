import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import OrganizationMemberModel from 'irene/models/organization-member';

interface AdminUserManagementUsersTableMemberActionDeactivateSignature {
  Args: {
    member: OrganizationMemberModel | null;
  };
}

export default class AdminUserManagementUsersTableMemberActionDeactivateComponent extends Component<AdminUserManagementUsersTableMemberActionDeactivateSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @tracked showEditModal = false;
  @tracked modaltitle: string | null = null;

  @action
  editMemberSetting() {
    if (this.args.member?.member.get('isActive')) {
      this.modaltitle = this.intl.t('userDeactivateTitle');
    } else {
      this.modaltitle = this.intl.t('userActivateTitle');
    }

    this.showEditModal = true;
  }

  changeSetting = task(async () => {
    const member = await this.args.member?.member;

    try {
      const isMemberActive = member?.get('isActive');

      member?.set('isActive', !isMemberActive);

      await member?.save();

      this.showEditModal = false;

      const message = isMemberActive
        ? this.intl.t('deactivated')
        : this.intl.t('activated');

      this.notify.success(`${message} ${member?.username}`);
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      member?.rollbackAttributes();

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });

  @action
  closeModal() {
    this.showEditModal = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationMember::List::MemberDetails::ChangeActivityStatus': typeof AdminUserManagementUsersTableMemberActionDeactivateComponent;
  }
}
