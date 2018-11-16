import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

const OverallReportComponent = Component.extend({

  analytics: service("analytics"),

  scancount: computed(function() {
    return this.get("analytics.scancount");
  }),

  chartOptions: (() =>
    ({
      scales: { yAxes: [{ ticks: { beginAtZero:true, stepSize: 1 } }]},
      legend: { display: false }
    })
  ).property(),

  appscanChartData: computed("analytics", function() {
    const appscanData = this.get("analytics.appscan");
    const data = {
      count: [],
      date: []
    };
    appscanData.results.forEach(appscan => {
      data.count.push(appscan.file_count);
      data.date.push(appscan.created_on_date);
    });
    return {
      labels: data.date,
      datasets: [{
        data: data.count,
        backgroundColor: [
          "#000",
          "#000"
        ]
      }]
    }
  })
});

export default OverallReportComponent;
