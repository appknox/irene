import Ember from 'ember';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';

const CompareSummaryComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  comparison: null,

  tagName: ["tr"],

  tAnalyzing: t("analyzing"),
  tUnchanged: t("unchanged"),
  tImproved: t("improved"),
  tWorsened: t("worsened"),

  vulnerability: (function() {
    return this.get("comparison")["vulnerability"];
  }).property("comparison"),

  file1Analysis: (function() {
    return this.get("comparison")['analysis1'];
  }).property("comparison"),

  file2Analysis: (function() {
    return this.get("comparison")['analysis2'];
  }).property("comparison"),

  compareColor: (function() {
    const cls = 'tag';
    const file1Risk = this.get("file1Analysis.computedRisk");
    const file2Risk = this.get("file2Analysis.computedRisk");
    if ([file1Risk, file2Risk].includes(ENUMS.RISK.UNKNOWN)) {
      return `${cls} is-progress`;
    } else if (file1Risk === file2Risk) {
      return `${cls} is-default`;
    } else if (file1Risk > file2Risk) {
      return `${cls} is-success`;
    } else if (file1Risk < file2Risk) {
      return `${cls} is-danger`;
    }
  }).property("file1Analysis.computedRisk", "file2Analysis.computedRisk"),

  compareText: (function() {
    const file1Risk = this.get("file1Analysis.computedRisk");
    const file2Risk = this.get("file2Analysis.computedRisk");

    const tAnalyzing = this.get("tAnalyzing");
    const tUnchanged = this.get("tUnchanged");
    const tImproved = this.get("tImproved");
    const tWorsened = this.get("tWorsened");

    if ([file1Risk, file2Risk].includes(ENUMS.RISK.UNKNOWN)) {
      return tAnalyzing;
    } else if (file1Risk === file2Risk) {
      return tUnchanged;
    } else if (file1Risk > file2Risk) {
      return tImproved;
    } else if (file1Risk < file2Risk) {
      return tWorsened;
    } else {
      return "-";
    }
  }).property("file1Analysis.computedRisk", "file2Analysis.computedRisk")
});


export default CompareSummaryComponent;
