/*
 * DS103: Rewrite code to no longer use __guard__
 */
import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const isEmpty = inputValue=> Ember.isEmpty(inputValue);

const TeamDetailsComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),

  team: null,
  teamMember: "",
  isInvitingMember: false,

  invitations: (function() {
    this.get("store").findAll("invitation");
  }).property(),

  tEmptyEmailId: t("emptyEmailId"),
  tTeamMemberAdded: t("teamMemberAdded"),
  tTeamMemberInvited: t("teamMemberInvited"),

  actions: {

    openAddMemberModal() {
      this.set("showAddMemberModal", true);
    },

    closeAddMemberModal() {
      this.set("showAddMemberModal", false);
    },

    addMember() {
      const teamMember = this.get("teamMember");
      const tEmptyEmailId = this.get("tEmptyEmailId");
      const tTeamMemberAdded = this.get("tTeamMemberAdded");
      const tTeamMemberInvited = this.get("tTeamMemberInvited");
      const teamId = this.get("team.id");
      const url = [ENV.endpoints.teams, teamId, ENV.endpoints.members].join('/');
      const that = this;
      for (let inputValue of [teamMember]) {
        if (isEmpty(inputValue)) { return this.get("notify").error(tEmptyEmailId); }
      }
      const data =
        {identification: teamMember};
      this.set("isInvitingMember", true);
      this.get("ajax").post(url, {data})
      .then(function(data){
        debugger
        that.set("isInvitingMember", false);
        if (__guard__(data != null ? data.data : undefined, x => x.type) === "team") {
          that.store.pushPayload(data);
          that.get("notify").success(tTeamMemberAdded);
        } else {
          that.get("notify").success(tTeamMemberInvited);
        }
        that.set("teamMember", "");
        that.set("showAddMemberModal", false);})
      .catch(function(error) {
        that.set("isInvitingMember", false);
        that.get("notify").error(error.payload.message);
      });
    }
  }
});


export default TeamDetailsComponent;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
