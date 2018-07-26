import Ember from 'ember';
import ENV from 'irene/config/environment';

export default Ember.Component.extend({
  fileDetails: (function() {
    const fileId = this.get("file.fileId");
    return this.get("store").findRecord("security/file", fileId);
  }).property(),

  ireneFilePath: (function() {
    const fileId = this.get("file.fileId");
    const ireneHost = ENV.ireneHost;
    return [ireneHost, "file", fileId].join('/');
  }).property(),

  actions: {
    generateReport() {
      const fileId = this.get("file.fileId");
      const email = this.get("email");
      const data = {
        email: email
      };
      this.set("isGeneratingReport", true);
      const url = [ENV.endpoints.reports, fileId].join('/');
      return this.get("ajax").put(url, { namespace: '/hudson-api', data, dataType: "text"})
      .then(() => {
        this.get("notify").success("Report Generated and sent to the Email ID(s)");
        this.set("isGeneratingReport", false);
        this.set("showGenerateReportModal", false);
      }, (error) => {
        this.set("isGeneratingReport", false);
        for (error of error.errors) {
          this.get("notify").error(error.detail.error);
        }
      });
    },

    openGenerateReportModal() {
      this.set("showGenerateReportModal", true);
    }
  }

});
