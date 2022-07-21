/* eslint-disable ember/no-array-prototype-extensions */
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { bb } from 'billboard.js/dist/billboard.min.js';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { task } from 'ember-concurrency';
import styles from './index.scss';

export default class PartnerClientUploadsStatChartComponent extends Component {
  // Dependencies
  @service store;
  @service organization;
  @service ajax;
  @service me;
  @service('notifications') notify;
  @service intl;
  @service partner;

  constructor() {
    super(...arguments);
    dayjs.extend(advancedFormat);
    dayjs.extend(weekOfYear);
    dayjs.extend(weekday);
  }

  // Properties
  datepickerOptions = [
    'last7Days',
    'last30Days',
    'thisMonth',
    'last6Months',
    'lastYear',
  ];

  @tracked isHideLegend = true;

  @tracked chartData = [];

  @tracked isRedrawChart = false;

  @tracked timelinePlaceholders = [
    {
      key: 'day',
      axisText: this.intl.t('day'),
      buttonSelectorText: this.intl.t('day'),
      dayjsSelector: 'day',
      format: 'DD MMM',
      tooltipFormat(d) {
        return new dayjs(d).format('DD MMM YYYY');
      },
    },
    {
      key: 'week',
      axisText: this.intl.t('week'),
      buttonSelectorText: this.intl.t('week'),
      dayjsSelector: 'week',
      format: 'DD MMM',
      tooltipFormat(d) {
        return `${dayjs(d).format('DD MMM YYYY')} - ${dayjs(d)
          .add(6, 'day')
          .format('DD MMM YYYY')}`;
      },
    },
    {
      key: 'month',
      axisText: this.intl.t('month'),
      buttonSelectorText: this.intl.t('month'),
      dayjsSelector: 'month',
      format: 'MMM YYYY',
      tooltipFormat(d) {
        return new dayjs(d).format('MMM YYYY');
      },
    },
  ];

  @tracked currentTimeline = this.timelinePlaceholders.objectAt(0);

  @tracked chartContainer = null;

  @tracked dateRange = [dayjs().subtract(1, 'month'), dayjs()];

  maxDate = dayjs(Date.now());

  get startDate() {
    return this.dateRange.objectAt(0);
  }
  get endDate() {
    return this.dateRange.objectAt(1);
  }

  get targetModel() {
    return this.args.targetModel;
  }

  get queryParams() {
    return { id: this.args.id };
  }

  @action
  onChangeTimeline(option) {
    this.currentTimeline = option;
    this.isRedrawChart = true;
    this.loadChart.perform();
  }
  @action
  updateDateRange(dateRange) {
    this.dateRange = dateRange;
    this.isRedrawChart = true;
    this.loadChart.perform();
  }

  /**
   * @function loadChart
   * Method to load chart data and inject chart into the DOM
   */
  @task(function* (element) {
    if (this.targetModel) {
      const filter = {
        start_timestamp: dayjs(this.startDate).format(),
        end_timestamp: dayjs(this.endDate).format(),
        ...this.queryParams,
      };

      const rawChartData = yield this.store.queryRecord(
        this.targetModel,
        filter
      );

      yield this.parseChartData(rawChartData.uploadTimeline);
      if (!this.isRedrawChart) {
        yield this.drawChart(element);
      } else {
        yield this.redrawChart();
      }
    }
  })
  loadChart;

  async redrawChart() {
    await this.chartContainer.axis.labels({
      x: this.currentTimeline.axisText.toUpperCase(),
    });
    await this.chartContainer.load({
      columns: this.chartData,
    });
    return;
  }

  async parseChartData(rawData) {
    const dataPoints = await this.generateTimeseriesData(
      rawData,
      this.currentTimeline.dayjsSelector
    );
    this.chartData = [dataPoints.x, dataPoints.y];
    return;
  }

  async generateTimeseriesData(rawData = [], groupBy = 'day') {
    const x = ['x'];
    const y = ['y'];
    let curPointDate = dayjs(this.startDate);
    while (dayjs(curPointDate).isBefore(this.endDate)) {
      const curpointFormattedDate = curPointDate.format('YYYY-MM-DD');
      // Find all data points which fall under given group
      const dataPoints = rawData.filter(
        (data) =>
          dayjs(data.created_on_date).startOf(groupBy).format('YYYY-MM-DD') ==
          curpointFormattedDate
      );
      // Insert/Update by date
      if (dataPoints.length) {
        dataPoints.map((dataPoint) => {
          let indexOfPoint = x.indexOf(curpointFormattedDate);
          if (indexOfPoint == -1) {
            x.push(curpointFormattedDate);
            indexOfPoint = x.length - 1;
          }
          if (y[indexOfPoint]) {
            y[indexOfPoint] = y[indexOfPoint] + dataPoint.upload_count;
          } else {
            y[indexOfPoint] = dataPoint.upload_count;
          }
        });
      } else {
        //Default data points {date, count}
        x.push(curpointFormattedDate);
        y.push(0);
      }
      curPointDate = dayjs(curPointDate).add(1, groupBy).startOf(groupBy);
    }
    return {
      x,
      y,
    };
  }

  async drawChart(element) {
    const component = this;
    component.chartContainer = await bb.generate({
      data: {
        x: 'x',
        columns: this.chartData,
        type: 'area', // for ESM specify as: bar()
      },
      grid: {
        focus: {
          show: false,
        },
      },
      axis: {
        x: {
          padding: {
            right: 1000 * 60 * 60 * 12,
          },
          type: 'timeseries',
          tick: {
            format: function (val) {
              return new dayjs(val).format(component.currentTimeline.format);
            },
          },
          label: {
            text: `${component.currentTimeline.axisText.toUpperCase()}`,
            position: 'outer-center',
          },
        },
        y: {
          padding: {
            bottom: 0,
          },
          min: 0,
          default: [0, 5],
          tick: {
            stepSize: 1,
          },
          label: {
            text: this.intl.t('uploadCount'),
            position: 'outer-middle',
          },
        },
      },
      legend: {
        show: false,
      },
      tooltip: {
        contents: function (d) {
          return component.tooltipTemplate(component, d[0].x, d[0].value); // formatted html as you want
        },
      },
      transition: {
        duration: 500,
      },
      bindto: element,
    });
    component.isRedrawChart = false;
    return;
  }

  /**
   * Method to get custom tooltip body
   * @param {Object} component
   * @param {Date} x
   * @param {Number} y
   */
  tooltipTemplate(component = this, x, y) {
    return htmlSafe(`<div class="${styles['tooltip']}">
                      <div>${component.currentTimeline.tooltipFormat(x)}</div>
                      <div><span class="${
                        styles['tt-val-label']
                      }">Uploads</span>: ${y}</div>
                    </div>`);
  }
}
