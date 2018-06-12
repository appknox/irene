import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const isEmpty = inputValue=> Ember.isEmpty(inputValue);

const CreateTeamComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
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
      const data =
        {name: teamName};
      this.set("isCreatingTeam", true);
      this.get("ajax").post(ENV.endpoints.teams, {data})
      .then((data) => {
        if(!this.isDestroyed) {
          this.set("isCreatingTeam", false);
          this.store.pushPayload(data);
          this.set("teamName", "");
          this.set("showTeamModal", false);
        }
        this.get("notify").success(tTeamCreated);
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isCreatingTeam", false);
          this.get("notify").error(error.payload.error);
        }
      });
    }
  }
});


export default CreateTeamComponent;
