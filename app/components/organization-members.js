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

  actions: {
    openAddMemberModal() {
      this.set("showAddMemberModal", true);
    },
    addMember() {
      const email = this.get("email");
      if(Ember.isEmpty(email)) {
        const tEmptyEmailId = this.get("tEmptyEmailId");
        return this.get("notify").error(tEmptyEmailId);
      }
      const data = {
        email
      };
      const orgId = this.get("organization.id");
      const url = [ENV.endpoints.organizations, orgId, ENV.endpoints.invitations].join('/');
      this.set("isInvitingMember", true);
      const that = this;
      this.get("ajax").post(url, {data})
      .then(function(){
        const tOrgMemberInvited = that.get("tOrgMemberInvited");
        that.get("notify").success(tOrgMemberInvited);
        if(!that.isDestroyed) {
          that.set("email", "");
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