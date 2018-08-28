import Ember from 'ember';

const OverallReportComponent = Ember.Component.extend({

  maxCVSS: 10,

  stat: (function() {
    return this.get('store').find('stat', 1);
  }).property(),

  chartOptions: (() =>
    ({
      scales: { yAxes: [{ ticks: { beginAtZero:true, stepSize: 1 } }]},
      legend: { display: false }
    })
  ).property(),

  guageOptions: (() =>
    ({
      cutoutPercentage: 0,
      rotation: -3.1415926535898,
      circumference: 3.1415926535898,
      legend: { display: false },
      borderWidth: 0,
      tooltips: { enabled: false }
    })
  ).property(),

  areaChartOptions: (() =>
    ({
      scales: { yAxes: [{ ticks: { beginAtZero:true, stepSize: 25, stacked: true } }]},
      legend: { display: false },
      elements: {line: {tension: 0}}
    })
  ).property()
});

export default OverallReportComponent;
