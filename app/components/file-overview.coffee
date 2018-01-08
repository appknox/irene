`import Ember from 'ember'`

FileOverviewComponent = Ember.Component.extend
  file: null
  fileOld: null
  classNames: ["card","file-card", "is-fullwidth", "margin-bottom20"]

  chartOptions: (->
    legend: { display: false }
    animation: {animateRotate: false}
  ).property()

`export default FileOverviewComponent`
