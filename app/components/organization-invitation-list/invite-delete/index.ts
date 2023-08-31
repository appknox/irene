import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import OrganizationInvitationModel from 'irene/models/organization-invitation';
import OrganizationTeamInvitationModel from 'irene/models/organization-team-invitation';

interface OrganizationMemberInvitationListInviteDeleteSignature {
  Args: {
    invitation: OrganizationInvitationModel | OrganizationTeamInvitationModel;
    reloadInvites: () => void;
    blurOverlay?: boolean;
  };
  Element: HTMLElement;
}

export default class OrganizationMemberInvitationListInviteDelete extends Component<OrganizationMemberInvitationListInviteDeleteSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;

  @tracked isDeletingInvitation = false;
  @tracked showDeleteInvitationConfirmBox = false;

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

      await invite.delete();

      this.notify.success(this.intl.t('invitationDeleted'));

      this.args.reloadInvites();

      triggerAnalytics(
        'feature',
        ENV.csb['inviteDelete'] as CsbAnalyticsFeatureData
      );
      this.showDeleteInvitationConfirmBox = false;
      this.isDeletingInvitation = false;
    } catch (e) {
      const error = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');
      if (error.errors && error.errors.length) {
        errMsg = error?.errors[0]?.detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }

      this.notify.error(errMsg);

      this.isDeletingInvitation = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'organization-member-invitation-list/invite-delete': typeof OrganizationMemberInvitationListInviteDelete;
    'OrganizationMemberInvitationList::InviteDelete': typeof OrganizationMemberInvitationListInviteDelete;
  }
}
