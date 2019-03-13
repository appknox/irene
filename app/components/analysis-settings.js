import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

const AnalysisSettingsComponent = Component.extend({

  project: null,
  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  isSavingStatus: false,
  tSavedPreferences: t("savedPreferences"),

  unknownAnalysisStatus: computed(function() {
    return this.get("store").queryRecord('unknown-analysis-status', {id: this.get("project.activeProfileId")});
  }),

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
