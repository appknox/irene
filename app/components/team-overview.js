import Ember from 'ember';
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
    team.destroyRecord()
    .then(() => {
      this.set("isDeletingTeam", false);
      this.get("notify").success(`${tTeam} - ${deletedTeam} ${tTeamDeleted} `);
    }, (error) => {
      this.set("isDeletingTeam", false);
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
