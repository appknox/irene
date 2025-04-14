import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationService from 'irene/services/organization';
import type IreneAjaxService from 'irene/services/ajax';
import type MeService from 'irene/services/me';
import type PartnerService from 'irene/services/partner';
import type { PartnerAnalyticUploadTimelineData } from 'irene/models/partner/analytic';
import type { ECOption, ECInstance } from 'irene/components/ak-chart';

import type {
  RangeDateObject,
  MultipleDateObject,
  CalendarDay,
} from 'irene/components/ak-date-picker';

import {
  TopLevelFormatterParams,
  CallbackDataParams,
} from 'echarts/types/dist/shared';

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

  @tracked currentTimeline;
  @tracked chartInstance: ECInstance | null = null;
  @tracked chartOption: ECOption = {};

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

    this.loadChart.perform();
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
    this.loadChart.perform();
  }

  @action
  updateDateRange(
    value: RangeDateObject | MultipleDateObject | CalendarDay | null
  ) {
    const dayjs = (value as RangeDateObject)?.dayjs;

    this.dateRange = [dayjs.start, dayjs.end];
    this.loadChart.perform();
  }

  @action
  onChartInit(instance: ECInstance) {
    this.chartInstance = instance;
  }

  async generateTimeseriesData(
    rawData: PartnerAnalyticUploadTimelineData[] = [],
    groupBy = 'day'
  ) {
    const xAxisData: string[] = [];
    const seriesData: number[] = [];

    let curPointDate = dayjs(this.startDate);

    while (dayjs(curPointDate).isBefore(this.endDate)) {
      const curpointFormattedDate = curPointDate.format('YYYY-MM-DD');
      const displayDate = curPointDate.format(this.currentTimeline?.format);

      // Find all data points which fall under given group
      const dataPoints = rawData.filter(
        (data) =>
          dayjs(data.created_on_date)
            .startOf(groupBy as dayjs.UnitType)
            .format('YYYY-MM-DD') == curpointFormattedDate
      );

      // Calculate total uploads for this date
      let totalUploads = 0;
      if (dataPoints.length) {
        totalUploads = dataPoints.reduce(
          (sum, point) => sum + point.upload_count,
          0
        );
      }

      xAxisData.push(displayDate);
      seriesData.push(totalUploads);

      const groupByVal = groupBy as dayjs.ManipulateType;
      curPointDate = dayjs(curPointDate).add(1, groupByVal).startOf(groupByVal);
    }

    return {
      xAxisData,
      seriesData,
    };
  }

  async updateChartOption(rawData: PartnerAnalyticUploadTimelineData[]) {
    const { xAxisData, seriesData } = await this.generateTimeseriesData(
      rawData,
      this.currentTimeline?.dayjsSelector
    );

    this.chartOption = this.createChartOption(xAxisData, seriesData);
  }

  createChartOption(xAxisData: string[], seriesData: number[]): ECOption {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: TopLevelFormatterParams) => {
          const cbParams = (params as CallbackDataParams[])[0];
          const dataIndex = cbParams?.dataIndex;

          const date = dayjs(this.startDate)
            .add(
              Number(dataIndex),
              this.currentTimeline?.dayjsSelector as dayjs.ManipulateType
            )
            .startOf(this.currentTimeline?.dayjsSelector as dayjs.UnitType);

          return `
            <div class="${styles['tooltip']}">
              <div>${this.currentTimeline?.tooltipFormat(date)}</div>
              <div><span class="${styles['tt-val-label']}">Uploads</span>: ${cbParams?.value}</div>
            </div>
          `;
        },
        extraCssText: 'padding: 0 !important; margin: 0 !important;',
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        name: this.currentTimeline?.axisText.toUpperCase(),
        nameLocation: 'middle',
        nameGap: 30,
        boundaryGap: false,
        axisLine: { show: true, lineStyle: { color: '#000', width: 1 } },
        axisLabel: { show: true, color: '#000' },
        axisTick: { show: true },
      },
      yAxis: {
        type: 'value',
        name: this.intl.t('uploadCount'),
        nameLocation: 'middle',
        nameGap: 40,
        minInterval: 1,
        axisLine: { show: true, lineStyle: { color: '#000', width: 1 } },
        axisLabel: { show: true, color: '#000' },
        axisTick: { show: true },
      },
      series: [
        {
          name: 'Uploads',
          type: 'line',
          data: seriesData,
          showSymbol: true,
          symbol: 'circle', // Add dots at data points
          symbolSize: 6,
          lineStyle: {
            width: 2, // Line thickness
          },
          areaStyle: {
            opacity: 0.3,
          },
        },
      ],
    };
  }

  /**
   * @function loadChart
   * Method to load chart data and inject chart into the DOM
   */
  loadChart = task(async () => {
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

      await this.updateChartOption(rawChartData.uploadTimeline);
    }
  });
}
