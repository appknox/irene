import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';

const CompareFilesComponent = Ember.Component.extend({

  file1: null,
  file2: null,
  isSummary: true,
  isReverse: false,

  i18n: Ember.inject.service(),
  tCompareWarningOldFile: t("compareWarningOldFile"),
  tCompareWarningSameFiles: t("compareWarningSameFiles"),

  summaryClass: Ember.computed("isSummary", function() {
    if (this.get("isSummary")) {
      return "is-active";
    }
  }),

  detailsClass: Ember.computed("isSummary", function() {
    if (!this.get("isSummary")) {
      return "is-active";
    }
  }),

  allFiles: (function() {
    const projectId = this.get("file1.project.id");
    this.set("selectedBaseFile", this.get("file1.id"));
    this.set("selectedCompareFile", this.get("file2.id"));
    const allFiles = [];
    this.get("store").query("file", {projectId:projectId, limit: 1000})
    .then((data) => {
      data.content.forEach((item) => {
        allFiles.push(item.id);
        this.set("allFiles", allFiles);
      });
    });
  }).property("file1.project.id", "file1.id", "file2.id"),

  compareText: (function() {
    const file1Id = parseInt(this.get("file1.id"));
    const file2Id = parseInt(this.get("file2.id"));
    const tCompareWarningOldFile = this.get("tCompareWarningOldFile");
    const tCompareWarningSameFiles = this.get("tCompareWarningSameFiles");
    if(file1Id === file2Id) {
      return tCompareWarningSameFiles;
    }
    else if(file1Id < file2Id) {
      return tCompareWarningOldFile;
    }
  }).property("file1.id", "file2.id"),

  allBaseFiles: Ember.computed.filter('allFiles', function(file) {
    return file !== this.get("file1.id");
  }).property("file1.id", "allFiles"),

  allCompareFiles: Ember.computed.filter('allFiles', function(file) {
    return file !== this.get("file2.id");
  }).property("file2.id", "allFiles"),

  comparisons: (function() {
    const comparisons = [];
    const file1Analyses = this.get("file1.analyses");
    const file2Analyses = this.get("file2.analyses");
    if (!file1Analyses || !file2Analyses) { return; }
    file1Analyses.forEach(function(analysis) {
      const vulnerability = analysis.get("vulnerability");
      const vulnerability_id  = parseInt(vulnerability.get("id"));
      if (!comparisons[vulnerability_id]) { comparisons[vulnerability_id] = {}; }
      comparisons[vulnerability_id]["analysis1"] = analysis;
      return comparisons[vulnerability_id]["vulnerability"] = vulnerability;
    });
    file2Analyses.forEach(function(analysis) {
      const vulnerability = analysis.get("vulnerability");
      const vulnerability_id  = parseInt(vulnerability.get("id"));
      if (!comparisons[vulnerability_id]) { comparisons[vulnerability_id] = {}; }
      comparisons[vulnerability_id]["analysis2"] = analysis;
      return comparisons[vulnerability_id]["vulnerability"] = vulnerability;
    });
    comparisons.removeObject(undefined);
    return comparisons;
  }).property("file1.analyses.@each.risk", "file2.analyses.@each.risk"),


  actions: {
    displaySummary() {
      this.set("isSummary", true);
    },

    displayDetails() {
      this.set("isSummary", false);
    },

    compareFiles() {
      const selectedBaseFile = this.get("selectedBaseFile");
      const selectedCompareFile = this.get("selectedCompareFile");
      const comparePath = `${selectedBaseFile}...${selectedCompareFile}`;
      Ember.getOwner(this).lookup('route:authenticated').transitionTo("authenticated.compare", comparePath);
    },

    selectBaseFile() {
      this.set("selectedBaseFile", parseInt(this.$('#base-file-id').val()));
      this.send("compareFiles");
    },

    selectCompareFile() {
      this.set("selectedCompareFile", parseInt(this.$('#compare-file-id').val()));
      this.send("compareFiles");
    }
  }
});

export default CompareFilesComponent;
