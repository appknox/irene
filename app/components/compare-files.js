import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { translationMacro as t } from 'ember-i18n';
import { getOwner } from '@ember/application';

const CompareFilesComponent = Component.extend({

  file1: null,
  file2: null,
  isSummary: true,
  isReverse: false,

  i18n: service(),
  tCompareWarningOldFile: t("compareWarningOldFile"),
  tCompareWarningSameFiles: t("compareWarningSameFiles"),

  summaryClass: computed("isSummary", function() {
    if (this.get("isSummary")) {
      return "is-active";
    }
  }),

  detailsClass: computed("isSummary", function() {
    if (!this.get("isSummary")) {
      return "is-active";
    }
  }),

  allFiles: computed("file1.{project.id,id}", "file2.id", function() {
    const projectId = this.get("file1.project.id");
    this.set("selectedBaseFile", this.get("file1.id")); // eslint-disable-line
    this.set("selectedCompareFile", this.get("file2.id")); // eslint-disable-line
    const allFiles = [];
    this.get("store").query("file", {projectId:projectId, limit: 1000})
    .then((data) => {
      data.content.forEach((item) => {
        allFiles.push(item.id);
        this.set("allFiles", allFiles); // eslint-disable-line
      });
    });
  }),

  compareText: computed("file1.id", "file2.id", function() {
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
  }),

  allBaseFiles: computed.filter('allFiles', function(file) {
    return file !== this.get("file1.id");
  }),

  allCompareFiles: computed.filter('allFiles', function(file) {
    return file !== this.get("file2.id");
  }),

  comparisons: computed("file1.analyses.@each.risk", "file2.analyses.@each.risk", function() {
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
  }),


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
      getOwner(this).lookup('route:authenticated').transitionTo("authenticated.compare", comparePath);
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
