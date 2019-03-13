import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const TeamOverviewComponent = Component.extend({

  i18n: service(),
  team: null,
  organization: null,
  tagName: ["tr"],

  isDeletingTeam: false,

  tTeam: t("team"),
  tTeamDeleted: t("teamDeleted"),
  tEnterRightTeamName: t("enterRightTeamName"),

  promptCallback(promptedItem) {
    const tTeam = this.get("tTeam");
    const tTeamDeleted = this.get("tTeamDeleted");
    const tEnterRightTeamName = this.get("tEnterRightTeamName");
    const team = this.get("team");
    const deletedTeam = team.get("name");
    const teamName = deletedTeam.toLowerCase();
    const promptedTeam = promptedItem.toLowerCase();
    if (promptedTeam !== teamName) {
      return this.get("notify").error(tEnterRightTeamName);
    }
    this.set("isDeletingTeam", true);
    const orgId = this.get("organization.id");
    const teamId = this.get("team.id");
    const url = [ENV.endpoints.organizations, orgId, ENV.endpoints.teams, teamId].join('/');
    const that = this;
    this.get("ajax").delete(url)
    .then(function(){
      that.set("isDeletingTeam", false);
      that.get("notify").success(`${tTeam} - ${deletedTeam} ${tTeamDeleted} `);
      that.set("showDeleteTeamPrompt", false);
    })
    .catch(function(error) {
      that.set("isDeletingTeam", false);
      for (error of error.errors) {
        this.get("notify").error(error.title || undefined);
      }
    });
  },

  actions: {
    openDeleteTeamPrompt() {
      this.set("showDeleteTeamPrompt", true);
    },

    closeDeleteTeamPrompt() {
      this.set("showDeleteTeamPrompt", false);
    }
  }
});


export default TeamOverviewComponent;
