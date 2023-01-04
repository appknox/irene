import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import ENUMS from 'irene/enums';

export default class OrganizationMemberListMemberRole extends Component {
  @service intl;
  @service me;
  @service('notifications') notify;

  roles = ENUMS.ORGANIZATION_ROLES.CHOICES.slice(0, -1);

  tUserRoleUpdated = this.intl.t('userRoleUpdated');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

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
  @task
  *selectMemberRole({ value: role }) {
    try {
      const member = this.args.member;
      member.set('role', role);
      yield member.save();

      this.notify.success(this.tUserRoleUpdated);
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  }
}
