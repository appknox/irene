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
      const that = this;
      this.set("isSavingStatus", true);
      this.get("ajax").put(url, {data})
      .then(function(){
        that.get("notify").success(tSavedPreferences);
        if(!that.isDestroyed) {
          that.set("isSavingStatus", false);
          that.set("unknownAnalysisStatus.status", isChecked);
        }
      })
      .catch(function(error) {
        that.set("isSavingStatus", false);
        that.get("notify").error(error.payload.message);
      });
    }
  }
});

export default AnalysisSettingsComponent;
