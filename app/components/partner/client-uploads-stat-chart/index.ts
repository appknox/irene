import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import bb, { type Chart, type PrimitiveArray } from 'billboard.js';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationService from 'irene/services/organization';
import type IreneAjaxService from 'irene/services/ajax';
import type MeService from 'irene/services/me';
import type PartnerService from 'irene/services/partner';
import type { PartnerAnalyticUploadTimelineData } from 'irene/models/partner/analytic';

import type {
  RangeDateObject,
  MultipleDateObject,
  CalendarDay,
} from 'irene/components/ak-date-picker';

import styles from './index.scss';

interface PartnerClientUploadsStatChartComponentSignature {
  Args: {
    id: string;
    title: string;
    targetModel: 'partner/partnerclient-analytic' | 'partner/analytic';
  };
}

export default class PartnerClientUploadsStatChartComponent extends Component<PartnerClientUploadsStatChartComponentSignature> {
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service declare ajax: IreneAjaxService;
  @service declare me: MeService;
  @service declare intl: IntlService;
  @service declare partner: PartnerService;
  @service('notifications') declare notify: NotificationService;

  datepickerOptions = [
    'last7Days',
    'last30Days',
    'thisMonth',
    'last6Months',
    'lastYear',
  ];

  maxDate = dayjs(Date.now()).toDate();

  @tracked isHideLegend = true;
  @tracked isRedrawChart = false;
  @tracked chartData: PrimitiveArray[] | undefined;
  @tracked chartContainer: Chart | null = null;
  @tracked currentTimeline;

  @tracked dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
    dayjs().subtract(1, 'months'),
    dayjs(),
  ];

  constructor(
    owner: unknown,
    args: PartnerClientUploadsStatChartComponentSignature['Args']
  ) {
    super(owner, args);

    dayjs.extend(advancedFormat);
    dayjs.extend(weekOfYear);
    dayjs.extend(weekday);

    this.currentTimeline = this.timelinePlaceholders.objectAt(0);
  }

  get timelinePlaceholders() {
    return [
      {
        key: 'day',
        axisText: this.intl.t('day'),
        buttonSelectorText: this.intl.t('day'),
        dayjsSelector: 'day',
        format: 'DD MMM',
        tooltipFormat(d: dayjs.ConfigType) {
          return dayjs(d).format('DD MMM YYYY');
        },
      },
      {
        key: 'week',
        axisText: this.intl.t('week'),
        buttonSelectorText: this.intl.t('week'),
        dayjsSelector: 'week',
        format: 'DD MMM',
        tooltipFormat(d: dayjs.ConfigType) {
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
        tooltipFormat(d: dayjs.ConfigType) {
          return dayjs(d).format('MMM YYYY');
        },
      },
    ];
  }

  get startDate() {
    return this.dateRange.objectAt(0);
  }

  get endDate() {
    return this.dateRange.objectAt(1);
  }

  get selectedDateRange() {
    const start = this.startDate;
    const end = this.endDate;

    return { start: start?.toDate() ?? null, end: end?.toDate() ?? null };
  }

  get targetModel() {
    return this.args.targetModel;
  }

  get queryParams() {
    return { id: this.args.id };
  }

  @action
  onChangeTimeline(option: typeof this.currentTimeline) {
    this.currentTimeline = option;
    this.isRedrawChart = true;

    this.loadChart.perform();
  }

  @action
  updateDateRange(
    value: RangeDateObject | MultipleDateObject | CalendarDay | null
  ) {
    const dayjs = (value as RangeDateObject)?.dayjs;

    this.dateRange = [dayjs.start, dayjs.end];

    this.isRedrawChart = true;
    this.loadChart.perform();
  }

  async redrawChart() {
    this.chartContainer?.axis.labels({
      x: this.currentTimeline?.axisText.toUpperCase() as string,
    });

    this.chartContainer?.load({
      columns: this.chartData,
    });

    return;
  }

  async parseChartData(rawData: PartnerAnalyticUploadTimelineData[]) {
    const dataPoints = await this.generateTimeseriesData(
      rawData,
      this.currentTimeline?.dayjsSelector
    );

    this.chartData = [dataPoints.x, dataPoints.y];

    return;
  }

  async generateTimeseriesData(
    rawData: PartnerAnalyticUploadTimelineData[] = [],
    groupBy = 'day'
  ) {
    const x = ['x'];
    const y: PrimitiveArray = ['y'];

    let curPointDate = dayjs(this.startDate);

    while (dayjs(curPointDate).isBefore(this.endDate)) {
      const curpointFormattedDate = curPointDate.format('YYYY-MM-DD');

      // Find all data points which fall under given group
      const dataPoints = rawData.filter(
        (data) =>
          dayjs(data.created_on_date)
            .startOf(groupBy as dayjs.UnitType)
            .format('YYYY-MM-DD') == curpointFormattedDate
      );

      // Insert/Update by date
      if (dataPoints.length) {
        dataPoints.forEach((dataPoint) => {
          let indexOfPoint = x.indexOf(curpointFormattedDate);

          if (indexOfPoint == -1) {
            x.push(curpointFormattedDate);

            indexOfPoint = x.length - 1;
          }

          const indexPointY = y[indexOfPoint];

          if (indexPointY) {
            y[indexOfPoint] = Number(indexPointY) + dataPoint.upload_count;
          } else {
            y[indexOfPoint] = dataPoint.upload_count;
          }
        });
      } else {
        //Default data points {date, count}
        x.push(curpointFormattedDate);
        y.push(0);
      }

      const groupByVal = groupBy as dayjs.ManipulateType;

      curPointDate = dayjs(curPointDate).add(1, groupByVal).startOf(groupByVal);
    }

    return {
      x,
      y,
    };
  }

  async drawChart(element: Element) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const component = this;

    component.chartContainer = bb.generate({
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
            format: function (val: dayjs.ConfigType) {
              return dayjs(val).format(component?.currentTimeline?.format);
            },
          },
          label: {
            text: `${component?.currentTimeline?.axisText.toUpperCase()}`,
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
          return component
            .tooltipTemplate(component, d[0].x, d[0].value)
            .toString(); // formatted html as you want
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
   * @type {PartnerClientUploadsStatChartComponent} component
   * @param {Date} x
   * @param {Number} y
   */
  tooltipTemplate(component = this, x: Date, y: number) {
    return htmlSafe(`
      <div class="${styles['tooltip']}">
        <div>${component.currentTimeline?.tooltipFormat(x)}</div>

        <div><span class="${styles['tt-val-label']}">Uploads</span>: ${y}</div>
      </div>
    `);
  }

  /**
   * @function loadChart
   * Method to load chart data and inject chart into the DOM
   */
  loadChart = task(async (element?: Element) => {
    if (this.targetModel) {
      const filter = {
        start_timestamp: dayjs(this.startDate).format(),
        end_timestamp: dayjs(this.endDate).format(),
        ...this.queryParams,
      };

      const rawChartData = await this.store.queryRecord(
        this.targetModel,
        filter
      );

      await this.parseChartData(rawChartData.uploadTimeline);

      if (!this.isRedrawChart && element) {
        await this.drawChart(element);
      } else {
        await this.redrawChart();
      }
    }
  });
}
