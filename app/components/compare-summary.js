/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects, prettier/prettier, ember/no-get, ember/require-return-from-computed */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENUMS from 'irene/enums';
import { t } from 'ember-intl';

const CompareSummaryComponent = Component.extend({
  intl: service(),
  comparison: null,

  tagName: ["tr"],

  tAnalyzing: t("analyzing"),
  tUnchanged: t("unchanged"),
  tImproved: t("improved"),
  tWorsened: t("worsened"),

  vulnerability: computed("comparison", function() {
    return this.get("comparison")["vulnerability"];
  }),

  file1Analysis: computed("comparison", function() {
    return this.get("comparison")['analysis1'];
  }),

  file2Analysis: computed("comparison", function() {
    return this.get("comparison")['analysis2'];
  }),

  compareColor: computed("file1Analysis.computedRisk", "file2Analysis.computedRisk", function() {
    const cls = 'tag';
    const file1Risk = this.get("file1Analysis.computedRisk");
    const file2Risk = this.get("file2Analysis.computedRisk");
    if ([file1Risk, file2Risk].includes(ENUMS.RISK.UNKNOWN)) {
      return `${cls} is-progress`;
    } else if (file1Risk === file2Risk) {
      return `${cls} is-default`;
    } else if (file1Risk < file2Risk) {
      return `${cls} is-success`;
    } else if (file1Risk > file2Risk) {
      return `${cls} is-critical`;
    }
  }),

  compareText: computed('file1Analysis.computedRisk', 'file2Analysis.computedRisk', 'tAnalyzing', 'tImproved', 'tUnchanged', 'tWorsened', function() {
    let file1Risk = this.get("file1Analysis.computedRisk");
    let file2Risk = this.get("file2Analysis.computedRisk");
    const tAnalyzing = this.get("tAnalyzing");
    const tUnchanged = this.get("tUnchanged");
    const tImproved = this.get("tImproved");
    const tWorsened = this.get("tWorsened");

    if ([file1Risk, file2Risk].includes(ENUMS.RISK.UNKNOWN)) {
      return tAnalyzing;
    } else if (file1Risk === file2Risk) {
      return tUnchanged;
    } else if (file1Risk < file2Risk) {
      return tImproved;
    } else if (file1Risk > file2Risk) {
      return tWorsened;
    } else {
      return "-";
    }
  })
});


export default CompareSummaryComponent;
