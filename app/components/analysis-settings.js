import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const AnalysisSettingsComponent = Ember.Component.extend({

  project: null,
  i18n: Ember.inject.service(),
  isSavingStatus: false,
  tSavedPreferences: t("savedPreferences"),

  actions: {

    showUnknownAnalysis() {
      const tSavedPreferences = this.get("tSavedPreferences");
      const isChecked = this.$('#show-unkown-analysis')[0].checked;
      const projectId = this.get("project.id");
      const unknownAnalysisStatus = [ENV.endpoints.setUnknownAnalysisStatus, projectId].join('/');
      const data =
        {status: isChecked};
      const that = this;
      this.set("isSavingStatus", true);
      this.get("ajax").post(unknownAnalysisStatus, {data})
      .then(function(data){
        that.set("isSavingStatus", false);
        that.set("project.showUnknownAnalysis", isChecked);
        that.get("notify").success(tSavedPreferences);
      })
      .catch(function(error) {
        that.set("isSavingStatus", false);
        that.get("notify").error(error.payload.message);
      });
    }
  }
});

export default AnalysisSettingsComponent;
