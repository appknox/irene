import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import ENUMS from 'irene/enums';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import OrganizationMemberModel from 'irene/models/organization-member';

interface OrganizationMemberListMemberRoleSignature {
  Args: {
    member: OrganizationMemberModel;
  };
  Element: HTMLDivElement;
}

export default class OrganizationMemberListMemberRole extends Component<OrganizationMemberListMemberRoleSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

  roles = ENUMS.ORGANIZATION_ROLES.CHOICES.slice(0, -1);
  /*
    Workaround: as it should never first grey the background
    then make it white (blinking).
  */
  get userDisabled() {
    return !this.args.member.member.get('isActive');
  }

  get selectedRole() {
    return this.roles.find((r) => r.value === this.args.member.role);
  }

  /* Change member role */
  selectMemberRole = task(async ({ value: role }) => {
    try {
      const member = this.args.member;
      member.set('role', role);
      await member.save();

      this.notify.success(this.intl.t('userRoleUpdated'));
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err?.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationMemberListMemberRole: typeof OrganizationMemberListMemberRole;
  }
}
