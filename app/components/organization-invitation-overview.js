import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';

const OrgInvitationComponent = Ember.Component.extend({

  tagName: ["tr"],
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  isDeletingInvitation: false,
  openDeleteInvitationConfirmBox: false,
  openResendInvitationConfirmBox: false,
  tInvitationDeleted: t("invitationDeleted"),
  notify: Ember.inject.service('notification-messages-service'),

  confirmCallback(key) {
    if(key === "delete") {
      // const tInvitationDeleted = this.get("tInvitationDeleted");
      this.set("isDeletingInvitation", true);
      // const that = this;
      // const url = [
      //   ENV.endpoints.organizations,
      //   this.get("organization.id"),
      //   ENV.endpoints.invitations,
      //   this.get("invitation.id")
      // ].join('/');
      const orgId = this.get('organization.id');
      const invId = this.get('invitation.id');
      return this.get("store").queryRecord('organization-invitation', {orgId: orgId, id: invId})
        .then(function(invite) {
          if (invite) {
            invite.deleteRecord();
            invite.save();
          }
        })
        .catch(function(err) {
          // eslint-disable-next-line no-console
          console.log(err)
        });
    }
    if(key === "resend") {
      // TODO: implement resend invitation
    }
  },

  actions: {
    openDeleteInvitationConfirmBox() {
      this.set("showDeleteInvitationConfirmBox", true);
    },
    openResendInvitationConfirmBox() {
      this.set('showResendInvitationConfirmBox', true)
    }
  }
});

export default OrgInvitationComponent;
