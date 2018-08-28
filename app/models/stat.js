import DS from 'ember-data';

const Stat = DS.Model.extend({

  totalCritical: DS.attr('number'),
  totalHigh: DS.attr('number'),
  totalMedium: DS.attr('number'),
  totalLow: DS.attr('number'),
  scanData: DS.attr(),
  totalAppsScanned: DS.attr('number'),
  totalAndroidApps: DS.attr('number'),
  totalIOSApps: DS.attr('number'),
  recentlyFixedIssues: DS.attr(),
  recentIssues: DS.attr(),
  totalStaticScans: DS.attr('number'),
  totalDynamicScans: DS.attr('number'),
  totalAPIScans: DS.attr('number'),
  totalManualScans: DS.attr('number'),
  overallCVSSSCore: DS.attr('string'),

  activities: DS.attr(),

  maxCVSS: 10,

  guageData: (function() {
    const overallCVSSSCore = this.get("overallCVSSSCore");
    const maxCVSS = this.get("maxCVSS");
    const remaniningCVSS = overallCVSSSCore - maxCVSS;
    return {
      labels: [
        'CVSS'
      ],
      datasets: [
        {
          data: [
            overallCVSSSCore, 0.1, remaniningCVSS
          ],
          backgroundColor: [
            "#EF4836",
            "#6B6B6B",
            "#EFE"
          ],
          borderWidth: 0,
          hoverBackgroundColor: [
            "#EF4836",
            "#6B6B6B",
            "#EFE"
          ]
        },
        {
          data: [
            overallCVSSSCore, 0.1, remaniningCVSS
          ],
          backgroundColor: [
            "#FFF",
            "#6B6B6B",
            "#FFF",
          ],
          borderWidth: 0,
          hoverBackgroundColor: [
            "#FFF",
            "#6B6B6B",
            "#FFF"
          ]
        },
      ]
    };
  }).property("overallCVSSSCore", "maxCVSS"),

  scanChartData: (function() {
    const scanData = this.get("scanData");
    let labels = [];
    let count = [];
    if(scanData) {
      scanData.map((data) => {
        labels.push(data.date);
        count.push(data.count);
      });
      return {
        labels: labels,
        datasets: [{
          data: count,
          backgroundColor: [
           "#00008b", "#00008b", "#00008b", "#00008b", "#00008b",
           "#00008b", "#00008b", "#00008b", "#00008b", "#00008b",
          ]
          },
        ]
      };
    }
  }).property("scanData"),

  barData: (function() {
    const totalCritical = this.get("totalCritical");
    const totalHigh = this.get("totalHigh");
    const totalMedium = this.get("totalMedium");
    const totalLow = this.get("totalLow");
    return {
      labels: [
        'CRITICAL',
        'HIGH',
        'MEDIUM',
        'LOW'
      ],
      datasets: [ {
        data: [
          totalCritical,
          totalHigh,
          totalMedium,
          totalLow
        ],
        backgroundColor: [
          "#EF4836",
          "#FF8C00",
          "#F5D76E",
          "#2CC2F8"
        ]
      } ]
    };
  }).property("totalCritical", "totalHigh", "totalMedium", "totalLow"),

  areaData: (function() {
    return {
      labels: [
        'JUL',
        'AUG',
        'SEP',
        'OCT'
      ],
      datasets: [
        {
          data: [
          75, 50, 25, 100
          ],
          fill: false,
          borderColor: "#80C081"
        },
        {
          data: [
            25, 50, 75, 100
          ],
          fill: false,
          borderColor: "#EF4836"
        }
      ]
    };
  }).property("totalCritical", "totalHigh", "totalMedium", "totalLow"),

  recentIssuesData: (function() {
    const recentIssues = this.get("recentIssues");
    let labels = [];
    let count = [];
    if(recentIssues) {
      recentIssues.map((data) => {
        labels.push(data.date);
        count.push(data.count);
      });
      return {
        labels: labels,
        datasets: [{
          data: count,
          borderColor: "#2CC2F8",
          backgroundColor: "#87CEFA"
          },
        ]
      };
    }
  }).property("recentIssues")

});

export default Stat;
