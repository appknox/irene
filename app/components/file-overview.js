/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-get */
import Component from '@ember/component';
import { computed } from '@ember/object';

const FileOverviewComponent = Component.extend({
  file: null,
  fileOld: null,
  classNames: ["card","file-card", "is-fullwidth", "margin-bottom20"],

  unknownAnalysisStatus: computed('profileId', 'store', function() {
    return this.get("store").queryRecord('unknown-analysis-status', {id: this.get("profileId")});
  }),

  chartOptions: computed(function() {
    return {
      legend: { display: false },
      animation: {animateRotate: false},
      responsive: false
    }
  })
});

export default FileOverviewComponent;
