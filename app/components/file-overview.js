import Ember from 'ember';

const FileOverviewComponent = Ember.Component.extend({
  file: null,
  fileOld: null,
  classNames: ["card","file-card", "is-fullwidth", "margin-bottom20"],

  unknownAnalysisStatus: (function() {
    return this.get("store").queryRecord('unknown-analysis-status', {id: this.get("profileId")});
  }).property(),

  chartOptions: (() =>
    ({
      legend: { display: false },
      animation: {animateRotate: false}
    })
  ).property()
});

export default FileOverviewComponent;
