import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { t } from 'ember-intl';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default class OrganizationTeamInvitationOverview extends Component {
  @service intl;
  @service ajax;
  @service('notifications') notify;
  @service realtime;
  @service store;

  tagName = ['tr'];
  isDeletingInvitation = false;
  isResendingInvitation = false;
  showDeleteInvitationConfirmBox = false;
  showResendInvitationConfirmBox = false;

  tInvitationReSent = t('invitationReSent');
  tInvitationDeleted = t('invitationDeleted');
  tPleaseTryAgain = t('pleaseTryAgain');

  /* Open resend-invitation confirmation */
  @action
  openResendInvitationConfirmBox() {
    this.showResendInvitationConfirmBox = true;
  }

  /* Resend invitation */
  @task
  *confirmResend() {
    try {
      this.isResendingInvitation = true;
      const invite = this.args.invitation;

      const orgInvite = yield this.store.find(
        'organization-invitation',
        invite.get('id')
      );

      yield orgInvite.resend();

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

      this.showResendInvitationConfirmBox = false;
      this.isResendingInvitation = false;
    }
  }

  /* Open delete-invitation confirmation */
  @action
  openDeleteInvitationConfirmBox() {
    this.showDeleteInvitationConfirmBox = true;
  }

  /* Delete invitation */
  @task
  *confirmDelete() {
    try {
      this.isDeletingInvitation = true;

      const invite = this.args.invitation;
      const orgInvite = yield this.store.find(
        'organization-invitation',
        invite.get('id')
      );

      yield orgInvite.deleteRecord();
      yield orgInvite.save();

      // signal to update invitation list
      this.realtime.decrementProperty('InvitationCounter');

      this.notify.success(this.tInvitationDeleted);
      triggerAnalytics('feature', ENV.csb.inviteDelete);

      this.showDeleteInvitationConfirmBox = false;
      this.isDeletingInvitation = false;
    } catch (error) {
      let errMsg = this.tPleaseTryAgain;

      if (error.errors && error.errors.length) {
        errMsg = error.errors[0].detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }

      this.notify.error(errMsg);
      this.isDeletingInvitation = false;
    }
  }
}
