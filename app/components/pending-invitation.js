import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const PendingInvitationComponent = Ember.Component.extend({

  tagName: ["tr"],
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  isDeletingInvitation: false,
  openDeleteInvitationConfirmBox: false,
  tInvitationDeleted: t("invitationDeleted"),
  notify: Ember.inject.service('notification-messages-service'),

  confirmCallback() {
    const tInvitationDeleted = this.get("tInvitationDeleted");
    const that = this;
    const orgId = this.get("organization.id");
    const invitationId = this.get("invitation.id");
    const url = [ENV.endpoints.organizations, orgId, ENV.endpoints.invitations, invitationId].join('/');
    this.set("isDeletingInvitation", true);
    this.get("ajax").delete(url)
    .then(function() {
      if(!that.isDestroyed) {
        that.set("isDeletelingInvitation", false);
      }
      that.get("notify").success(tInvitationDeleted);
      that.set("showDeleteInvitationConfirmBox", false);
    })
    .catch(function(error) {
      if(!that.isDestroyed) {
        that.set("isDeletingInvitation", false);
        that.get("notify").error(error.payload.message);
      }
    });
  },

  actions: {
    openDeleteInvitationConfirmBox() {
      this.set("showDeleteInvitationConfirmBox", true);
    }
  }
});

export default PendingInvitationComponent;
