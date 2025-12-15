import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type AnalyticsService from 'irene/services/analytics';
import type OrganizationInvitationModel from 'irene/models/organization-invitation';
import type OrganizationTeamInvitationModel from 'irene/models/organization-team-invitation';

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
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  @tracked isDeletingInvitation = false;
  @tracked showDeleteInvitationConfirmBox = false;

  /* Open delete-invitation confirmation */
  @action
  openDeleteInvitationConfirmBox() {
    this.showDeleteInvitationConfirmBox = true;
  }

  /* Close delete-invitation confirmation */
  @action
  closeDeleteInvitationConfirmBox() {
    this.showDeleteInvitationConfirmBox = false;
  }

  /* Delete invitation */
  confirmDelete = task(async () => {
    try {
      this.isDeletingInvitation = true;

      const invite = this.args.invitation;

      await invite.delete();

      this.notify.success(this.intl.t('invitationDeleted'));

      this.args.reloadInvites();

      this.analytics.track({
        name: 'ORGANIZATION_INVITE_EVENT',
        properties: {
          feature: 'delete_invitation',
          invitationId: invite.id,
        },
      });

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
