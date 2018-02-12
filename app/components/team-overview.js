/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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
    return team.destroyRecord()
    .then(function(){
      that.set("isDeletingTeam", false);
      return that.get("notify").success(`${tTeam} - ${deletedTeam} ${tTeamDeleted} `);}).catch(function(error) {
      that.set("isDeletingTeam", false);
      that.get("notify").error(error.payload.message);
      return (() => {
        const result = [];
        for (error of Array.from(error.errors)) {
          result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
        }
        return result;
      })();
    });
  },

  actions: {
    openDeleteTeamPrompt() {
      return this.set("showDeleteTeamPrompt", true);
    },

    closeDeleteTeamPrompt() {
      return this.set("showDeleteTeamPrompt", false);
    }
  }
});


export default TeamOverviewComponent;
