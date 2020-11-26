import Component from '@ember/component';
import {
  task
} from 'ember-concurrency';
import ENV from 'irene/config/environment';
import {
  inject as service
} from '@ember/service';
import {
  bb
} from 'billboard.js/dist/billboard.min.js';
import {
  observer
} from '@ember/object';
import dayjs from 'dayjs';
import {
  humanizeMonths
} from 'irene/utils/date-time';

class ChartData {
  @service() datetime;
  constructor() {
    this.dates = [];
    this.months = [];
    this.years = [];
    this.dates_obj = {};
    this.projects_order = [];
    this.projects_mapping = {};
    this.showMonthlyData = false;
    this.showYearlyData = false;
  }

  getChartX() {
    const dates = this.dates.map(d => d.toDate());
    if (this.showMonthlyData) {
      const group_dates = dates.reduce(function (obj, item) {
        const key = `${item.getMonth()}${item.getYear()}`
        obj[key] = obj[key] || [];
        obj[key].push(item);
        return obj;
      }, {});

      const humanized_months = humanizeMonths();

      const all_months = [];
      const months_obj = [];

      Object.keys(group_dates).map(function (key) {
        months_obj.push({
          'date': group_dates[key][0]
        });
        return months_obj;
      });

      months_obj.sort((a, b) => new dayjs(a.date).format('YYYYMMDD') - new dayjs(b.date).format('YYYYMMDD'));

      const months = Object.keys(months_obj).map(function (key) {
        all_months.push(months_obj[key].date);
        return humanized_months[months_obj[key].date.getMonth()];
      });
      this.months = all_months;
      if (this.months.length > 12) {
        const years = []
        const startYear = this.months[0].getFullYear()
        const endYear = this.months[this.months.length - 1].getFullYear()
        for (let i = startYear; i <= endYear; i++) years.push(i);
        this.years = years;
        this.showYearlyData = true;
        return ['x', ...years]
      }
      return ['x', ...months]
    }
    return ['x', ...dates];
  }

  getChartProject(project) {
    const yarray_dates = Array.from(new Array(this.dates.length), () => 0);
    const yarray_months = Array.from(new Array(this.months.length), () => 0);
    const yarray_years = Array.from(new Array(this.years.length), () => 0);
    const project_mapping = this.projects_mapping[project];
    let yarray = []


    if (!project_mapping) {
      return []
    }

    project_mapping.forEach(obj => {
      if (obj.package_name != project) {
        return;
      }
      let index;
      if (this.showMonthlyData) {
        if (yarray_months.length > 12) {
          index = this.find_year_index(dayjs(obj.created_on_date));
          yarray_years[index] = yarray_years[index] + parseInt(obj.file_count);
          yarray = yarray_years
        } else {
          index = this.find_month_index(dayjs(obj.created_on_date));
          yarray_months[index] = yarray_months[index] + parseInt(obj.file_count);
          yarray = yarray_months
        }
      } else {
        index = this.find_date_index(dayjs(obj.created_on_date));
        yarray_dates[index] = yarray_dates[index] + obj.file_count;
        yarray = yarray_dates
      }
    });
    return [project, ...yarray];
  }

  getChartProjects() {
    return this.projects_order.map(
      project => this.getChartProject(project)
    )
  }

  getProjects() {
    return this.projects_order
  }

  showGroupedData(value) {
    this.showMonthlyData = value;
  }

  showGroupedYearlyData() {
    return this.showYearlyData;
  }

  push(obj) {
    const incoming_date = dayjs(obj.created_on_date);
    this.push_date(incoming_date);
    this.dates_obj[incoming_date].push(obj)
    this.projects_order.push()
    if (!this.projects_mapping[obj.package_name]) {
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
    if (first_date && first_date.isAfter(incoming_date)) {
      const days = first_date.diff(incoming_date, 'days')
      dates_to_push = Array.from(
        new Array(days)
      ).map((d, i) => incoming_date.clone().add(i, 'days'))
    }
    const last_date = this.dates[this.dates.length - 1];
    if (last_date && last_date.isBefore(incoming_date)) {
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
      if (current_date.isBefore(incoming_date, 'day')) {
        startIndex = index + 1;
      } else if (current_date.isAfter(incoming_date, 'day')) {
        endIndex = index - 1;
      } else {
        return index;
      }
    }
    return -1;
  }

  find_month_index(incoming_date) {
    const yarray_months = Array.from(new Array(this.months.length), () => 0);
    let index;
    Object.keys(yarray_months).find(key => {
      if (this.months[key].getMonth() == incoming_date.month()) {
        index = key
      }
    });
    return index
  }

  find_year_index(incoming_date) {
    const yarray_years = Array.from(new Array(this.years.length), () => 0);
    let index;
    Object.keys(yarray_years).find(key => {
      if (this.years[key] == incoming_date.year()) {
        index = key
      }
    });
    return index
  }

}
const OverallReportComponent = Component.extend({

  ajax: service('ajax'),
  realtime: service('realtime'),
  analytics: service('analytics'),
  organization: service('organization'),
  datetime: service('datetime'),
  showMonthlyData: true,
  showYearlyData: false,
  axisXType: 'category',
  axisXTickFormat: '',
  axisXLabelText: 'months',
  axisYType: 'number',
  scanCount: null,


  didInsertElement() {
    this.get('resetDuration').perform();
    this.scanCountData();
  },

  analyticsObserver: observer('analytics.appscan', 'analytics.scancount', function () {
    this.appscanData();
    this.scanCountData();
  }),

  showMonthlyDataObserver: observer('showMonthlyData', 'showYearlyData', function () {
    if (this.get("showMonthlyData")) {
      this.setProperties({
        axisXType: 'category',
        axisXTickFormat: '',
        axisXLabelText: 'months',
        axisYType: 'number'
      });
      if (this.get("showYearlyData")) {
        return this.set("axisXLabelText", 'years')
      }
      return this.set("axisXLabelText", 'months')
    }
    this.setProperties({
      axisXType: 'timeseries',
      axisXTickFormat: '%d/%m',
      axisXLabelText: 'days',
      axisYType: 'timeseries'
    });
  }),

  scanCountData() {
    const scanCountData = this.get("analytics.scancount");
    this.set("scanCount", scanCountData);
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
    chartData.showGroupedData(this.get("showMonthlyData"));
    sortedData.forEach(data => chartData.push(data));
    const xData = chartData.getChartX();
    const yData = chartData.getChartProjects()
    const projects = chartData.getProjects()
    this.set("showYearlyData", chartData.showGroupedYearlyData());
    bb.generate({
      data: {
        x: "x",
        columns: [
          xData,
          ...yData
        ],
        type: "bar",
        groups: [
          projects
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
          type: this.get("axisXType"),
          tick: {
            format: this.get("axisXTickFormat")
          },
          label: {
            text: this.get("axisXLabelText"),
            position: 'outer-right'
          },
        },
        y: {
          padding: 0,
          default: [0, 5],
          min: 0,
          type: this.get("axisYType"),
          label: {
            text: 'no. of scans',
            position: 'outer-center'
          },
          tick: {
            fit: false,
            format: function (x) {
              return Math.floor(x);
            }
          }
        }
      },
    });
  },

  updateStartDate: task(function* ({
    date
  }) {
    this.set("selectedStartDate", date);
    yield this.get('updateAppScan').perform();
  }),

  updateEndDate: task(function* ({
    date
  }) {
    this.set("selectedEndDate", date);
    yield this.get('updateAppScan').perform();
  }),

  updateAppScan: task(function* () {
    const startDate = this.get("selectedStartDate");
    const endDate = this.get("selectedEndDate");
    if (!startDate || !endDate) {
      return;
    }
    const monthDiff = Math.abs(dayjs(startDate).diff(dayjs(endDate), 'month'));
    this.set("showMonthlyData", monthDiff > 0);
    const orgId = this.get("organization.selected.id");
    let url = [ENV.endpoints.organizations, orgId, ENV.endpoints.appscan].join('/');
    url += `?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`;
    const appscan = yield this.get('ajax').request(url);
    this.set("analytics.appscan", appscan);
  }),

  showHideDuration: task(function* () {
    yield this.set("showDatePicker", true);
  }),

  resetDuration: task(function* () {
    this.set("showDatePicker", false);
    this.set("showMonthlyData", true);
    this.setProperties({
      selectedStartDate: null,
      selectedEndDate: null
    });
    yield this.get("analytics").get_appscan()
  })

});

export default OverallReportComponent;
