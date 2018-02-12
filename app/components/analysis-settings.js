import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const AnalysisSettingsComponent = Ember.Component.extend({

  project: null,
  i18n: Ember.inject.service(),
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
      return this.get("ajax").post(unknownAnalysisStatus, {data})
      .then(function(data){
        that.set("project.showUnknownAnalysis", isChecked);
        return that.get("notify").success(tSavedPreferences);}).catch(function(error) {
        that.get("notify").error(error.payload.message);
        return (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })();
      });
    }
  }
});

export default AnalysisSettingsComponent;
