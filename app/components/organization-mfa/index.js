import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

class OrganizationMfa extends Component {
  @service intl;
  @service('notifications') notify;

  @tracked isSavingStatus = false;
  @tracked showAddEditPopup = false;

  tChangedMandatoryMFA = this.intl.t('changedMandatoryMFA');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  get isMfaMandateDisabled() {
    return !this.args.user.mfaEnabled || this.isSavingStatus;
  }

  get isUserMfaDisabled() {
    return !this.args.user.mfaEnabled;
  }

  @task()
  *setMandatoryMFA(event, checked) {
    try {
      this.isSavingStatus = true;
      const org = this.args.organization;

      org.mandatoryMfa = checked;

      yield org.save();

      this.isSavingStatus = false;
      this.notify.success(this.tChangedMandatoryMFA);
    } catch (err) {
      this.isSavingStatus = false;
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

export default OrganizationMfa;
