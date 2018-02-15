import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const isEmpty = inputValue=> Ember.isEmpty(inputValue);

const CreateTeamComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),

  teamName: "",

  isCreatingTeam: false,

  tTeamCreated: t("teamCreated"),
  tEnterTeamName: t("enterTeamName"),

  actions: {
    openTeamModal() {
      this.set("showTeamModal", true);
    },

    createTeam() {
      const teamName = this.get("teamName");
      const tTeamCreated = this.get("tTeamCreated");
      const tEnterTeamName = this.get("tEnterTeamName");

      for (let inputValue of [teamName]) {
        if (isEmpty(inputValue)) { return this.get("notify").error(tEnterTeamName); }
      }
      triggerAnalytics('feature', ENV.csb.createTeam);
      const that = this;
      const data =
        {name: teamName};
      this.set("isCreatingTeam", true);
      this.get("ajax").post(ENV.endpoints.teams, {data})
      .then(function(data){
        that.set("isCreatingTeam", false);
        that.store.pushPayload(data);
        that.get("notify").success(tTeamCreated);
        that.set("teamName", "");
        that.set("showTeamModal", false);})
      .catch(function(error) {
        that.set("isCreatingTeam", false);
        that.get("notify").error(error.payload.error);
      });
    }
  }
});


export default CreateTeamComponent;
