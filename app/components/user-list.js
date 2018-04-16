import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  identification: "",
  isInvitingMember: false,

  tEmptyEmailId: t("emptyEmailId"),
  tOrgMemberInvited: t("orgMemberInvited"),

  orgUsers: (function() {
    return this.get("store").query('organization-user', {id: this.get("organization.id")});
  }).property(),

  actions: {
    openAddMemberModal() {
      this.set("showAddMemberModal", true);
    },
    addMember() {
      const identification = this.get("identification");
      if(Ember.isEmpty(identification)) {
        const tEmptyEmailId = this.get("tEmptyEmailId");
        return this.get("notify").error(tEmptyEmailId);
      }
      const data = {
        identification
      };
      this.set("isInvitingMember", true);
      const that = this;
      this.get("ajax").post(ENV.endpoints.invitations, {data})
      .then(function(){
        const tOrgMemberInvited = that.get("tOrgMemberInvited");
        that.get("notify").success(tOrgMemberInvited);
        if(!that.isDestroyed) {
          that.set("identification", "");
          that.set("isInvitingMember", false);
          that.set("showAddMemberModal", false);
        }
      })
      .catch(function(error){
        that.set("isInvitingMember", false);
        that.get("notify").error(error.payload.message);
      });
    }
  }
});
