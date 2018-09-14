import Ember from 'ember';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import ENV from 'irene/config/environment';

export default Ember.Component.extend({

  vulnerabilities: (function() {
    return this.get("store").findAll("security/vulnerability")
  }).property(),

  fileDetails: (function() {
    const fileId = this.get("file.fileId");
    return this.get("store").findRecord("security/file", fileId);
  }).property(),

  ireneFilePath: (function() {
    const fileId = this.get("file.fileId");
    const ireneHost = ENV.ireneHost;
    return [ireneHost, "file", fileId].join('/');
  }).property(),

  openAddAnalysisModal: task(function *() {
    this.set("showAddAnalysisModal", true);
  }),

  selectVulnerabilty: task(function *(value) {
    this.set("selectedVulnerability", value);
  }).evented(),

  addAnalysis: task(function *() {
    const vulnerabilityId = this.get("selectedVulnerability.id");
    const fileId = this.get("file.fileId");

    const analyses = this.get("store").createRecord('security/analysis',
      {
        vulnerability: {id:vulnerabilityId},
        file: {id:fileId}
      }
    );
    analyses.save();
  }).evented(),

  addAnalysisSucceeded: on('addAnalysis:succeeded', function() {

  }),

  addAnalysisErrored: on('addAnalysis:errored', function() {

  }),

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
      return this.get("ajax").put(url, { namespace: '/hudson-api', data, contentType: 'application/json'})
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
