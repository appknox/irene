import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationInvitationModel from 'irene/models/organization-invitation';
import type OrganizationTeamInvitationModel from 'irene/models/organization-team-invitation';
import type AnalyticsService from 'irene/services/analytics';

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
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  @tracked isResendingInvitation = false;
  @tracked showResendInvitationConfirmBox = false;

  /* Open resend-invitation confirmation */
  @action
  openResendInvitationConfirmBox() {
    this.showResendInvitationConfirmBox = true;
  }

  /* Close resend-invitation confirmation */
  @action
  closeResendInvitationConfirmBox() {
    this.showResendInvitationConfirmBox = false;
  }

  /* Resend invitation */
  confirmResend = task(async () => {
    try {
      this.isResendingInvitation = true;
      const invite = this.args.invitation;

      await waitForPromise(invite.resend());

      this.notify.success(this.intl.t('invitationReSent'));

      this.analytics.track({
        name: 'ORGANIZATION_INVITE_EVENT',
        properties: {
          feature: 'resend_invitation',
          invitationId: invite.id,
        },
      });

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
