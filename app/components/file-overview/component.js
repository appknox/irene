import Component from '@ember/component';
import {
  computed
} from '@ember/object';

const FileOverviewComponent = Component.extend({
  file: null,
  fileOld: null,
  classNames: ["card", "file-card", "is-fullwidth", "margin-bottom20"],

  unknownAnalysisStatus: computed('profileId', 'store', function () {
    console.log('file overview', this.get('profileId'))
    return this.get("store").queryRecord('unknown-analysis-status', {
      id: 1
    });
  }),

  chartOptions: computed(() =>
    ({
      legend: {
        display: false
      },
      animation: {
        animateRotate: false
      },
      responsive: false
    })
  )
});

export default FileOverviewComponent;
