import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const AnalysisSettingsComponent = Ember.Component.extend({

  project: null,
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  isSavingStatus: false,
  tSavedPreferences: t("savedPreferences"),

  unknownAnalysisStatus: (function() {
    return this.get("store").queryRecord('unknown-analysis-status', {id: this.get("project.activeProfileId")});
  }).property(),

  actions: {

    showUnknownAnalysis() {
      const tSavedPreferences = this.get("tSavedPreferences");
      const isChecked = this.$('#show-unkown-analysis')[0].checked;
      const profileId = this.get("project.activeProfileId");
      const url = [ENV.endpoints.profiles, profileId, ENV.endpoints.unknownAnalysisStatus].join('/');
      const data = {
        status: isChecked
      };
      this.set("isSavingStatus", true);
      this.get("ajax").put(url, {data})
      .then(() => {
        this.get("notify").success(tSavedPreferences);
        if(!this.isDestroyed) {
          this.set("isSavingStatus", false);
          this.set("unknownAnalysisStatus.status", isChecked);
        }
      }, (error) => {
        this.set("isSavingStatus", false);
        this.get("notify").error(error.payload.message);
      });

    }
  }
});

export default AnalysisSettingsComponent;
