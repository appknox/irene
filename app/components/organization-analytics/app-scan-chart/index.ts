import { action } from '@ember/object';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import { BarSeriesOption } from 'echarts/charts';

import OrganizationService from 'irene/services/organization';
import { ECInstance, ECOption } from 'irene/components/ak-chart';
import parseError from 'irene/utils/parse-error';
import { humanizeMonths } from 'irene/utils/date-time';

import {
  CalendarOnSelectFunc,
  RangeDateObject,
} from 'irene/components/ak-date-picker';

export interface IAppScanResult {
  created_on_date: string;
  file_count: string;
  package_name: string;
  platform: string;
}

export interface IAppScan {
  results: IAppScanResult[];
}

interface AppScanDataItem {
  name: string;
  value: number;
  meta: {
    createdOnDate: string[];
  };
}

interface AppScanDataItemGroup {
  months?: string[];
  years?: number[];
  data: Record<string, AppScanDataItem[]>;
}

export default class OrganizationAnalyticsAppScanChartComponent extends Component {
  @service declare ajax: any;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked chartOption: ECOption = {};
  @tracked chartInstance: ECInstance | null = null;

  /**
   * @property {Array} dateRange
   * Property holds default range of last 6 months
   */
  @tracked dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
    dayjs().subtract(6, 'months'),
    dayjs(),
  ];

  datepickerOptions = ['last3Months', 'last6Months', 'lastYear'];
  maxDate = dayjs(Date.now()).toDate();

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchAppScan.perform();
  }

  get selectedDateRange() {
    const start = this.dateRange[0];
    const end = this.dateRange[1];

    return { start: start?.toDate() ?? null, end: end?.toDate() ?? null };
  }

  @action
  updateDateRange(...args: Parameters<CalendarOnSelectFunc>) {
    const range = args[0] as RangeDateObject;

    this.dateRange = [range.dayjs.start, range.dayjs.end];

    this.fetchAppScan.perform();
  }

  @action
  handleOnChartInit(instance: ECInstance) {
    this.chartInstance = instance;
  }

  fetchAppScan = task(async () => {
    const startDate = this.dateRange[0];
    const endDate = this.dateRange[1];

    if (!startDate || !endDate) {
      return;
    }

    const orgId = this.organization?.selected?.id;

    const url = [
      ENV.endpoints['organizations'],
      orgId,
      ENV.endpoints['appscan'],
    ]
      .join('/')
      .concat(
        `?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
      );

    try {
      const appScan = (await this.ajax.request(url)) as IAppScan;

      this.createAppScanChart(appScan, startDate.toDate(), endDate.toDate());
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  createAppScanChart(appScan: IAppScan, startDate: Date, endDate: Date) {
    // clear previous chart data to maintain data integrity
    this.chartInstance?.clear();

    const sortedAppScan = appScan.results.sortBy('created_on_date');
    const monthDiff = Math.abs(dayjs(startDate).diff(dayjs(endDate), 'month'));

    let series: BarSeriesOption[] = [];
    let xAxis: ECOption['xAxis'] = {};

    // check for more than 1 month between start & end date
    if (monthDiff > 0) {
      const yearDiff = Math.abs(dayjs(startDate).diff(dayjs(endDate), 'year'));

      // there can be more than 12 months so check for more than 1 year between start & end date
      if (yearDiff > 0) {
        const { data, years } = this.groupAppScanByMonthOrYear(
          sortedAppScan,
          'years'
        );

        series = (years || []).reduce(this.reduceToBarSeriesOption(data), []);
        xAxis = { data: years, name: 'Years' };
      } else {
        const { data, months } = this.groupAppScanByMonthOrYear(
          sortedAppScan,
          'months'
        );

        series = (months || []).reduce(this.reduceToBarSeriesOption(data), []);
        xAxis = { data: months, name: 'Months' };
      }
    } else {
      const { data, days } = this.groupAppScanByDay(sortedAppScan);

      series = days.reduce(this.reduceToBarSeriesOption(data), []);
      xAxis = { data: days, name: 'Days' };
    }

    // plot graph scans grouped by day | month | year
    this.chartOption = this.getOption(series, xAxis);
  }

  reduceToBarSeriesOption(data: Record<string, AppScanDataItem[]>) {
    return (
      accumlatedValue: BarSeriesOption[],
      currentValue: string | number,
      index: number
    ) => {
      const appScanDataItems = (data[currentValue] as AppScanDataItem[]).sort(
        (a, b) => a.value - b.value
      );

      appScanDataItems.forEach((item, scanIndex) => {
        const seriesOption = accumlatedValue[scanIndex];

        // check for series option for scan index
        if (seriesOption && seriesOption.data) {
          // if already present push data
          seriesOption.data.push(item);
        } else {
          // otherwise create new data padding
          const dataItems = Array.from(new Array(index)).fill('-');

          // and push scan data
          dataItems.push(item);

          // push series option with new data
          accumlatedValue.push({
            type: 'bar',
            colorBy: 'data',
            stack: 'appScanStack',
            data: dataItems,
          });
        }
      });

      // if series length is greater than scans then add padding for remaining series option
      if (accumlatedValue.length > appScanDataItems.length) {
        for (let i = appScanDataItems.length; i < accumlatedValue.length; i++) {
          accumlatedValue[i]?.data?.push('-');
        }
      }

      return accumlatedValue;
    };
  }

  getOption(series: ECOption['series'], xAxis: ECOption['xAxis']): ECOption {
    return {
      xAxis: {
        type: 'category',
        ...xAxis,
      },
      yAxis: {
        name: 'No. of Scans',
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          snap: true,
        },
        formatter(params) {
          // @ts-expect-error type definition not proper
          // prettier-ignore
          return `<strong>${xAxis.data[params.dataIndex]}</strong> <br /> ${params.marker} ${params.name}: ${params.value}`;
        },
      },
      series: series,
    };
  }

  /**
   * Method to group and aggregate app scans by months or years
   * @param {IAppScanResult[]} appScan list of app scans
   * @param {'months' | 'years'} type whether to group by months or years
   * @returns {AppScanDataItemGroup}
   */
  groupAppScanByMonthOrYear(
    appScan: IAppScanResult[],
    type: 'months' | 'years'
  ) {
    const monthsOrYears: (string | number)[] = [];

    // stores index of app scan for a particular month or year
    const monthOrYearPackageNameIndexMap: Record<
      string,
      Record<string, number>
    > = {};

    return {
      [type]: monthsOrYears, // set year or month values
      data: appScan.reduce(
        (acc, curr) => {
          // month or year
          const key =
            type === 'months'
              ? (this.monthNames[dayjs(curr.created_on_date).month()] as string)
              : dayjs(curr.created_on_date).year();

          const appScanDataItems = acc[key];

          if (appScanDataItems) {
            const currentDataItem = this.setAppScanDataItem(curr);
            const packageNameIndexMap = monthOrYearPackageNameIndexMap[key];

            if (
              packageNameIndexMap &&
              typeof packageNameIndexMap[curr.package_name] !== 'undefined'
            ) {
              const previousDataItem =
                appScanDataItems[
                  packageNameIndexMap[curr.package_name] as number
                ];

              if (previousDataItem) {
                previousDataItem.value += currentDataItem.value;
                previousDataItem.meta.createdOnDate.push(curr.created_on_date);

                return acc;
              }
            }

            monthOrYearPackageNameIndexMap[key] = {
              ...(monthOrYearPackageNameIndexMap[key] || {}),
              [curr.package_name]: appScanDataItems.length,
            };

            return {
              ...acc,
              [key]: [...appScanDataItems, currentDataItem],
            };
          }

          // push month/year if does not exist
          monthsOrYears.push(key);

          monthOrYearPackageNameIndexMap[key] = {
            [curr.package_name]: 0,
          };

          return {
            ...acc,
            [key]: [this.setAppScanDataItem(curr)],
          };
        },
        {} as Record<string, AppScanDataItem[]>
      ),
    } as AppScanDataItemGroup;
  }

  groupAppScanByDay(appScan: IAppScanResult[]) {
    const days: string[] = [];

    return {
      days,
      data: appScan.reduce(
        (acc, curr) => {
          const day = dayjs(curr.created_on_date).format(
            'DD MMM, YY'
          ) as string;

          if (acc[day]) {
            return {
              ...acc,
              [day]: [
                ...(acc[day] as AppScanDataItem[]),
                this.setAppScanDataItem(curr),
              ],
            };
          }

          // push day if does not exist
          days.push(day);

          return {
            ...acc,
            [day]: [this.setAppScanDataItem(curr)],
          };
        },
        {} as Record<string, AppScanDataItem[]>
      ),
    };
  }

  setAppScanDataItem(appScanResult: IAppScanResult): AppScanDataItem {
    return {
      name: appScanResult.package_name,
      value: parseInt(appScanResult.file_count),
      meta: {
        createdOnDate: [appScanResult.created_on_date],
      },
    };
  }

  get startDate() {
    return this.dateRange[0]
      ? dayjs(this.dateRange[0].toDate()).format('DD MMM YYYY')
      : null;
  }

  get endDate() {
    return this.dateRange[1]
      ? dayjs(this.dateRange[1].toDate()).format('DD MMM YYYY')
      : null;
  }

  get monthNames() {
    return humanizeMonths();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationAnalytics::AppScanChart': typeof OrganizationAnalyticsAppScanChartComponent;
  }
}
