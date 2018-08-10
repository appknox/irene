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
      const emails = this.get("emails");
      let data = {
      };
      if(!Ember.isEmpty(emails)) {
        data = {
          emails: emails.split(",").map(item => item.trim())
        };
      }
      this.set("isGeneratingReport", true);
      const url = [ENV.endpoints.reports, fileId].join('/');
      return this.get("ajax").put(url, { namespace: '/hudson-api', data: JSON.stringify(data), contentType: 'application/json'})
      .then(() => {
        this.set("isGeneratingReport", false);
        this.set("reportGenerated", true);
        this.set("emailIDs", emails.split(','));
        this.set("emails", "");
      }, (error) => {
        this.set("isGeneratingReport", false);
        for (error of error.errors) {
          this.get("notify").error(error.detail.error);
        }
      });
    },

    openGenerateReportModal() {
      this.set("reportGenerated", false);
      this.set("showGenerateReportModal", true);
    }
  }

});
