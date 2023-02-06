import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';

export default class OrganizationMemberInvitationListInviteResend extends Component {
  @service intl;
  @service ajax;
  @service('notifications') notify;

  @tracked isResendingInvitation = false;
  @tracked showResendInvitationConfirmBox = false;

  tInvitationReSent = this.intl.t('invitationReSent');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  /* Open resend-invitation confirmation */
  @action
  openResendInvitationConfirmBox() {
    this.showResendInvitationConfirmBox = true;
  }

  /* Resend invitation */
  confirmResend = task(async () => {
    try {
      this.isResendingInvitation = true;
      const invite = this.args.invitation;

      await invite.resend();

      this.notify.success(this.tInvitationReSent);
      triggerAnalytics('feature', ENV.csb.inviteResend);

      this.showResendInvitationConfirmBox = false;
      this.isResendingInvitation = false;
    } catch (error) {
      let errMsg = this.tPleaseTryAgain;

      if (error.errors && error.errors.length) {
        errMsg = error.errors[0].detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }

      this.notify.error(errMsg);

      this.isResendingInvitation = false;
    }
  });
}
