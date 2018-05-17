import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({

  isSavingStatus: false,
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  tSavedReportPreference: t("savedReportPreference"),

  actions: {
    showIgnoredAnalysis() {
      const isChecked = this.$('#show-ignored-analysis')[0].checked;
      const profileId = this.get("project.activeProfileId");
      const tSavedReportPreference = this.get("tSavedReportPreference");
      const url = [ENV.endpoints.profiles, profileId, ENV.endpoints.reportPreference].join('/');
      const data = {
        show_ignored_analyses: isChecked
      };
      const that = this;
      this.set("isSavingStatus", true);
      this.get("ajax").put(url, {data})
      .then(function(){
        that.get("notify").success(tSavedReportPreference);
        if(!that.isDestroyed) {
          that.set("isSavingStatus", false);
          that.set("project.showIgnoredAnalysis", isChecked);
        }
      })
      .catch(function(error) {
        that.set("isSavingStatus", false);
        that.get("notify").error(error.payload.message);
      });
    }
  }
});
