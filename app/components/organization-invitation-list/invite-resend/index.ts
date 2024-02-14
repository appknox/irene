import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { waitForPromise } from '@ember/test-waiters';

import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import OrganizationInvitationModel from 'irene/models/organization-invitation';
import OrganizationTeamInvitationModel from 'irene/models/organization-team-invitation';

interface OrganizationInvitationListInviteResendSignature {
  Args: {
    invitation: OrganizationInvitationModel | OrganizationTeamInvitationModel;
    reloadInvites: () => void;
    blurOverlay?: boolean;
  };
  Element: HTMLDivElement;
}

export default class OrganizationInvitationListInviteResend extends Component<OrganizationInvitationListInviteResendSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;

  @tracked isResendingInvitation = false;
  @tracked showResendInvitationConfirmBox = false;

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

      await waitForPromise(invite.resend());

      this.notify.success(this.intl.t('invitationReSent'));
      triggerAnalytics(
        'feature',
        ENV.csb['inviteResend'] as CsbAnalyticsFeatureData
      );

      this.showResendInvitationConfirmBox = false;
      this.isResendingInvitation = false;
    } catch (e) {
      const error = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (error.errors && error.errors.length) {
        errMsg = error?.errors[0]?.detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }

      this.notify.error(errMsg);

      this.isResendingInvitation = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'organization-invitation-list/invite-resend': typeof OrganizationInvitationListInviteResend;
    'OrganizationInvitationList::InviteResend': typeof OrganizationInvitationListInviteResend;
  }
}
