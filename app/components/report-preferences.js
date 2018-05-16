import Ember from 'ember';
import ENV from 'irene/config/environment';

export default Ember.Component.extend({

  isSavingStatus: false,

  actions: {
    showIgnoredAnalysis() {
      const isChecked = this.$('#show-ignored-analysis')[0].checked;
      const profileId = this.get("project.activeProfileId");
      const url = [ENV.endpoints.profiles, profileId, ENV.endpoints.reportPreference].join('/');
      const data = {
        show_ignored_analyses: isChecked
      };
      const that = this;
      this.set("isSavingStatus", true);
      this.get("ajax").put(url, {data})
      .then(function(){
        that.get("notify").success("Success");
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
