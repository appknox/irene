/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
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
    return this.get("store").findAll("invitation");
  }).property(),

  tEmptyEmailId: t("emptyEmailId"),
  tTeamMemberAdded: t("teamMemberAdded"),
  tTeamMemberInvited: t("teamMemberInvited"),

  actions: {

    openAddMemberModal() {
      return this.set("showAddMemberModal", true);
    },

    closeAddMemberModal() {
      return this.set("showAddMemberModal", false);
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
      return this.get("ajax").post(url, {data})
      .then(function(data){
        that.set("isInvitingMember", false);
        if (__guard__(data != null ? data.data : undefined, x => x.type) === "team") {
          that.store.pushPayload(data);
          that.get("notify").success(tTeamMemberAdded);
        } else {
          that.get("notify").success(tTeamMemberInvited);
        }
        that.set("teamMember", "");
        return that.set("showAddMemberModal", false);}).catch(function(error) {
        that.set("isInvitingMember", false);
        that.get("notify").error(error.payload.message);
        return (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })();
      });
    }
  }
});


export default TeamDetailsComponent;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}