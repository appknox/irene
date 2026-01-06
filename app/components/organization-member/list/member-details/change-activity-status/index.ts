import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import OrganizationMemberModel from 'irene/models/organization-member';

interface OrganizationMemberChangeActivitySignature {
  Args: {
    member: OrganizationMemberModel | null;
  };
}

export default class OrganizationMemberChangeActivityComponent extends Component<OrganizationMemberChangeActivitySignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @tracked showEditModal = false;

  @action
  editMemberSetting() {
    this.showEditModal = true;
  }

  get modalTitle() {
    return this.args.member?.member.get('isActive')
      ? this.intl.t('userDeactivateTitle')
      : this.intl.t('userActivateTitle');
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
    'OrganizationMember::List::MemberDetails::ChangeActivityStatus': typeof OrganizationMemberChangeActivityComponent;
  }
}
