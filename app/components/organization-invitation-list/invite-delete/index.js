import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';

export default class OrganizationMemberInvitationListInviteDelete extends Component {
  @service intl;
  @service ajax;
  @service('notifications') notify;

  @tracked isDeletingInvitation = false;
  @tracked showDeleteInvitationConfirmBox = false;

  tInvitationDeleted = this.intl.t('invitationDeleted');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  /* Open delete-invitation confirmation */
  @action
  openDeleteInvitationConfirmBox() {
    this.showDeleteInvitationConfirmBox = true;
  }

  /* Delete invitation */
  confirmDelete = task(async () => {
    try {
      this.isDeletingInvitation = true;

      const invite = this.args.invitation;

      invite.deleteRecord();
      await invite.save();

      this.notify.success(this.tInvitationDeleted);

      this.args.reloadInvites();

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
  });
}
