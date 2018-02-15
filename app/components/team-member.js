import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const TeamMemberComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  team: null,
  tagName: ["tr"],

  isRemovingMember: false,

  tEnterRightUserName: t("enterRightUserName"),
  tTeamMember: t("teamMember"),
  tTeamMemberRemoved: t("teamMemberRemoved"),

  promptCallback(promptedItem) {
    const tTeamMember = this.get("tTeamMember");
    const tTeamMemberRemoved = this.get("tTeamMemberRemoved");
    const tEnterRightUserName = this.get("tEnterRightUserName");
    const teamMember = this.get("member");
    if (promptedItem !== teamMember) {
      return this.get("notify").error(tEnterRightUserName);
    }
    const teamId = this.get("team.id");
    const url = [ENV.endpoints.teams, teamId, ENV.endpoints.members, teamMember].join('/');
    const that = this;
    this.set("isRemovingMember", true);
    this.get("ajax").delete(url)
    .then(function(data){
      that.set("isRemovingMember", false);
      that.store.pushPayload(data);
      that.get("notify").success(`${tTeamMember} ${teamMember} ${tTeamMemberRemoved}`);})
    .catch(function(error) {
      that.set("isRemovingMember", false);
      that.get("notify").error(error.payload.message);
    });
  },

  actions: {

    openRemoveMemberPrompt() {
      this.set("showRemoveMemberPrompt", true);
    },

    closeRemoveMemberPrompt() {
      this.set("showRemoveMemberPrompt", false);
    }
  }
});


export default TeamMemberComponent;
