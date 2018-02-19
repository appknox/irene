import Ember from 'ember';

const CompareFilesComponent = Ember.Component.extend({

  file1: null,
  file2: null,
  isSummary: true,
  isReverse: false,

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
    }
  }
});

export default CompareFilesComponent;
