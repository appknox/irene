import Component from '@ember/component';

const OverallReportComponent = Component.extend({

  // stat: (function() {
  //   return this.get('store').find('stat', 1);
  // }).property(),
  //
  // chartOptions: (() =>
  //   ({
  //     scales: { yAxes: [{ ticks: { beginAtZero:true, stepSize: 1 } }]},
  //     legend: { display: false }
  //   })
  // ).property(),
  //
  // barData: (function() {
  //   const totalCritical = this.get("stat.totalCritical");
  //   const totalHigh = this.get("stat.totalHigh");
  //   const totalMedium = this.get("stat.totalMedium");
  //   const totalLow = this.get("stat.totalLow");
  //   return {
  //     labels: [
  //       'CRITICAL',
  //       'HIGH',
  //       'MEDIUM',
  //       'LOW'
  //     ],
  //     datasets: [ {
  //       data: [
  //         totalCritical,
  //         totalHigh,
  //         totalMedium,
  //         totalLow
  //       ],
  //       backgroundColor: [
  //         "#EF4836",
  //         "#FF8C00",
  //         "#F5D76E",
  //         "#2CC2F8"
  //       ]
  //     } ]
  //   };
  // }).property("stat.totalCritical", "stat.totalHigh", "stat.totalMedium", "stat.totalLow")
});

export default OverallReportComponent;
