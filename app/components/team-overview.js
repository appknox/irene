import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const TeamOverviewComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),
  team: null,
  classNames: ["column", "is-one-third"],

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
    const that = this;
    team.destroyRecord()
    .then(function(){
      that.set("isDeletingTeam", false);
      that.get("notify").success(`${tTeam} - ${deletedTeam} ${tTeamDeleted} `);})
    .catch(function(error) {
      that.set("isDeletingTeam", false);
      for (error of error.errors) {
        that.get("notify").error(error.title || undefined);
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
