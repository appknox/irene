import Component from '@glimmer/component';
import {
  tracked
} from '@glimmer/tracking';
import {
  bb
} from 'billboard.js/dist/billboard.min.js';
import {
  action
} from '@ember/object'
import {
  task
} from 'ember-concurrency';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';
import {
  inject as service
} from '@ember/service';
import ENV from 'irene/config/environment';

export default class ChartsClientUploadsComponent extends Component {

  // Dependencies
  @service store;

  @service ajax;

  constructor() {
    super(...arguments)
    dayjs.extend(advancedFormat);
    dayjs.extend(weekOfYear);
    dayjs.extend(weekday);
  }

  // Properties
  @tracked isHideLegend = true;

  @tracked chartData = [];

  @tracked isRedrawChart = false;

  @tracked currentTimeline = {
    key: "month",
    axisKey: 'month',
    format: 'MMM/YY'
  };

  @tracked timelinePlaceholders = [{
      key: "month",
      axisKey: 'month',
      format: 'MMM/YY'
    },
    {
      key: "week",
      axisKey: 'week',
      format: 'YYYY-MM-DD'
    }, {
      key: "day",
      axisKey: 'date',
      format: 'DD/MMM'
    }
  ];

  @tracked chartContainer = null;

  // vals = {
  //   day: {
  //     date: ['2021-02-01', '2021-02-02', '2021-02-03', '2021-02-04', '2021-02-05', '2021-02-06', '2021-02-07', '2021-02-08'],
  //     val: [1, 4, 6, 2, 9, 10, 4, 0]
  //   },
  //   week: {
  //     val: [7, 3, 20, 16, 7, 4, 9, 19],
  //     date: ["2021-01-04", "2021-01-11", "2021-01-18", "2021-01-25", "2021-02-01", "2021-02-08", "2021-02-15", "2021-02-22"]
  //   },
  //   month: {
  //     val: [10, 40, 22, 40, 55, 66, 11, 29, 49, 20, 60, 55],
  //     date: ["2021-01-01", "2021-02-01", "2021-03-18", "2021-04-25", "2021-05-01", "2021-06-08", "2021-07-15", "2021-08-22", "2021-09-22", "2021-10-22", "2021-11-22", "2021-12-22"]
  //   }
  // }

  // Actions
  async drawChart(element) {
    const component = this;
    component.chartContainer = await bb.generate({
      data: {
        x: "x",
        columns: this.chartData,
        type: "area", // for ESM specify as: bar()
      },
      // color: {
      //   pattern: ['#FE4D3F']
      // },
      grid: {
        focus: {
          show: false
        }
      },
      axis: {
        x: {
          type: "timeseries",
          tick: {
            format: function (val) {
              console.log('chart date', val)
              return new dayjs(val).format(component.currentTimeline.format);
              // return 'MM'
            }
          },
          label: {
            text: `${component.currentTimeline.key.toUpperCase()}`,
            position: "outer-center"
          }

        },
        y: {
          label: {
            text: "Upload Count",
            position: "outer-middle"
          }
        }
      },
      legend: {
        show: false
      },
      bindto: element
    });
    component.isRedrawChart = false;
    return;
  }

  @action
  onChangeTimeline(option) {
    if (this.currentTimeline !== option.key) {
      this.currentTimeline = option;
      this.isRedrawChart = true;
      this.loadChart.perform();
      // yield this.updateChart.perform();
    }
  }

  // Functions

  /**
   * @function loadChart
   * Method to load chart data and inject chart into the DOM
   */
  @task(function* (element) {
    console.log('ENV', ENV)
    const url = `1${this.args.clientId ? '/clients/'+this.args.clientId : ''}/${ENV.endpoints.partnerOverallScansCount}?timelines=${this.currentTimeline.key}`;
    const rawChartData = yield this.ajax.request(url, {
      namespace: 'api/v2/partner'
    });
    console.log('rawChartData', rawChartData)
    yield this.parseChart.perform(rawChartData);
    if (!this.isRedrawChart) {
      yield this.drawChart(element);
    } else {
      yield this.redrawChart.perform();
    }

  }) loadChart;

  @task(function* (rawData) {
    const chartData = rawData.statistics[this.currentTimeline.key];
    console.log('chartData', chartData)
    const xAxisData = ['x'];
    const yAxisData = ['y'];
    chartData.map((data) => {
      xAxisData.push(data.date);
      yAxisData.push(data.count)
    })
    this.chartData = yield [xAxisData, yAxisData];
    return this.chartData;
  }) parseChart;

  @task(function* () {
    yield this.chartContainer.axis.labels({
      x: this.currentTimeline.key.toUpperCase()
    })
    yield this.chartContainer.load({
      columns: this.chartData
    });
    return;
  })
  redrawChart;

}
