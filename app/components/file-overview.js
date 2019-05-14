import Component from '@ember/component';
import { computed } from '@ember/object';

const FileOverviewComponent = Component.extend({
  file: null,
  fileOld: null,
  classNames: ["card", "file-card", "is-fullwidth", "margin-bottom20"],

  unknownAnalysisStatus: computed(function () {
    return this.get("store").queryRecord('unknown-analysis-status', { id: this.get("profileId") });
  }),

  chartOptions: computed(() =>
    ({
      legend: { display: false },
      animation: { animateRotate: false }
    })
  )
});

export default FileOverviewComponent;
