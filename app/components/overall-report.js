import Component from '@ember/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import { inject as service } from '@ember/service';
import {bb} from 'billboard.js';
import moment from 'moment';
import { observer } from '@ember/object';

class ChartData {
  constructor() {
    this.dates =  [];
    this.dates_obj = {};
    this.projects_order = [];
    this.projects_mapping = {};
  }

  getChartX() {
    const dates = this.dates.map(d=>d.toDate());
    return ['x', ...dates];
  }

  getChartProject(project) {
    const yarray = Array.from(new Array(this.dates.length), () => 0);
    const project_mapping = this.projects_mapping[project];

    if (!project_mapping){
      return []
    }

    project_mapping.forEach(obj => {
      if(obj.package_name != project) {
        return;
      }
      const index = this.find_date_index(moment(obj.created_on_date));
      yarray[index] = yarray[index] + obj.file_count;
    })

    return [project, ...yarray];
  }

  getProjects() {
    return this.projects_order;
  }

  push(obj) {
    const incoming_date = moment(obj.created_on_date);
    this.push_date(incoming_date);
    this.dates_obj[incoming_date].push(obj)
    this.projects_order.push()
    if(!this.projects_mapping[obj.package_name]) {
      this.projects_order.push(obj.package_name)
      this.projects_mapping[obj.package_name] = []
    }
    this.projects_mapping[obj.package_name].push(obj);
  }

  push_date(incoming_date) {

    const indexExists = this.find_date_index(incoming_date) !== -1;
    if (indexExists) {
      return;
    }
    let index = 0;
    let dates_to_push = [incoming_date];
    const first_date = this.dates[0];
    if(first_date && first_date.isAfter(incoming_date)) {
      const days = first_date.diff(incoming_date, 'days')
      dates_to_push = Array.from(
        new Array(days)
      ).map((d, i) => incoming_date.clone().add(i, 'days'))
    }
    const last_date = this.dates[this.dates.length - 1];
    if(last_date && last_date.isBefore(incoming_date)) {
      index = this.dates.length;
      const days = incoming_date.diff(last_date, 'days');
      dates_to_push = Array.from(
        new Array(days)
      ).map((d, i) => incoming_date.clone().subtract(i, 'days')).reverse();
    }

    this.dates.splice(index, 0, ...dates_to_push);
    dates_to_push.forEach(tobeinserteddate => {
      this.dates_obj[tobeinserteddate] = this.dates_obj[tobeinserteddate] || [];
    })
  }

  find_date_index(incoming_date) {
    const length = this.dates.length;
    let startIndex = 0;
    let endIndex = length - 1;
    while (startIndex <= endIndex) {
      let index = Math.floor((endIndex + startIndex) / 2);
      let current_date = this.dates[index];
      if(current_date.isBefore(incoming_date, 'day')) {
        startIndex = index + 1;
      } else if(current_date.isAfter(incoming_date, 'day')) {
        endIndex = index - 1;
      } else {
        return index;
      }
    }
    return -1;
  }
}
const OverallReportComponent = Component.extend({

  ajax: service('ajax'),
  realtime: service('realtime'),
  analytics: service('analytics'),
  organization: service('organization'),

  didInsertElement() {
    this.appscanData();
    this.scanCountData();
  },

  analyticsObserver: observer('analytics.appscan', 'analytics.scancount', function () {
    this.appscanData();
    this.scanCountData();
  }),

  scanCountData() {
    const scanCountData = this.get("analytics.scancount");
    bb.generate({
      data: {
        columns: [
          ['Android', scanCountData.total_android_scan_count],
          ['iOS', scanCountData.total_ios_scan_count],
        ],
        type: "donut",
      },
      bindto: "#scan-count-chart",
      donut: {
        title: `Total App Scans: ${scanCountData.total_scan_count}`,
        label: {
          format: function (value) {
            return value;
          }
        }
      }
    });
  },

  appscanData() {
    const appscanData = this.get("analytics.appscan");
    const sortedData = appscanData.results.sortBy('created_on_date');
    const chartData = new ChartData();
    sortedData.forEach(data => chartData.push(data));
    window.charttest = chartData;
    window.test = bb.generate({
      data: {
        x: "x",
        columns: [
          chartData.getChartX(),
          ...chartData.getProjects().map(
            project => chartData.getChartProject(project)
          )
        ],
        type: "bar",
        groups: [
          chartData.getProjects()
        ]
      },
      legend: {
        show: false
      },
      tooltip: {
        grouped: false
      },
      bindto: "#app-scan-chart",
      axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%d/%m'
            },
          label: {
            text: 'day',
            position: 'outer-right'
          },
        },
        y: {
          padding: 0,
          default: [0, 5],
          min: 0,
          type: 'timeseries',
          label: {
            text: 'no. of scans',
            position: 'outer-center'
          },
          tick: {
            fit: false,
            format: function(x){
              return Math.floor(x);
            }
          }
        }
    },
    });
  },

  projects: computed('realtime.ProjectCounter', function() {
    return this.get("store").query("organization-project", {limit:3});
  }),

  scancount: computed(function() {
    return this.get("analytics.scancount");
  }),

  updateStartDate: task(function * ({date}) {
    this.set("selectedStartDate", date.toLocaleDateString());
    this.set("startDate", date.toISOString());
    yield this.get('updateAppScan').perform();
  }),

  updateEndDate: task(function * ({date}) {
    this.set("selectedEndDate", date.toLocaleDateString());
    this.set("endDate", date.toISOString());
    yield this.get('updateAppScan').perform();
  }),

  updateAppScan: task(function *() {
    const startDate = this.get("startDate");
    const endDate = this.get("endDate");
    if(!startDate || !endDate) {
      return;
    }
    const orgId = this.get("organization.selected.id");
    let url = [ENV.endpoints.organizations, orgId, ENV.endpoints.appscan].join('/');
    url += `?start_date=${startDate}&end_date=${endDate}`;
    const appscan = yield this.get('ajax').request(url);
    this.set("analytics.appscan", appscan);
  }),

  showHideDuration: task(function *() {
    yield this.set("showDatePicker", true);
  })

});

export default OverallReportComponent;
