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
      const data = {};
      const url = [ENV.endpoints.reports, fileId].join('/');
      return this.get("ajax").put(url, { namespace: '/hudson-api', data, dataType: "text"})
      .then(() => {
        this.get("notify").success("Report Generated and sent to the Email ID(s)");
      }, (error) => {
        for (error of error.errors) {
          this.get("notify").error(error.detail.error);
        }
      });
    }
  }

});
