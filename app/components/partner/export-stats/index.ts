import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';

import type {
  CalendarDay,
  MultipleDateObject,
  RangeDateObject,
} from 'irene/components/ak-date-picker';

export interface PartnerExportStatsComponentSignature {
  Element: HTMLElement;
  Args: {
    startDate: Date;
    endDate: Date;
  };
}

export default class PartnerExportStatsComponent extends Component<PartnerExportStatsComponentSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked dateRange = [...this.initialDateRange];

  maxDate = dayjs(Date.now()).toDate();

  datepickerOptions = [
    'clear',
    'last7Days',
    'last30Days',
    'thisMonth',
    'last6Months',
    'lastYear',
  ];

  get initialDateRange() {
    if (this.args.startDate && this.args.endDate) {
      return [this.args.startDate, this.args.endDate];
    }

    if (this.args.startDate) {
      return [this.args.startDate, null];
    }

    if (this.args.endDate) {
      return [null, this.args.endDate];
    }

    return [null, null];
  }

  get selectedDateRange() {
    const start = this.dateRange[0] ?? null;
    const end = this.dateRange[1] ?? null;

    return { start, end };
  }

  @action
  updateDateRange(
    value: RangeDateObject | MultipleDateObject | CalendarDay | null
  ) {
    const date = (value as RangeDateObject)?.date;

    this.dateRange = [date?.start ?? null, date?.end ?? null];
  }

  @action
  async downloadCSV() {
    const url = await this.fetchDownloadUrl.perform();

    if (url?.csv) {
      const element = document.createElement('a');

      element.setAttribute('href', url.csv);
      element.setAttribute('download', 'dashboard_analytics.csv');
      element.setAttribute('style', 'display: none');
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  }

  fetchDownloadUrl = task(async () => {
    const startDate = this.dateRange.objectAt(0);
    const endDate = this.dateRange.objectAt(1);

    try {
      if (startDate && endDate) {
        const filters = {
          start_timestamp: dayjs(startDate).format(),
          end_timestamp: dayjs(endDate).format(),
        };

        return await this.store
          .adapterFor('partner/analytic')
          .getDownloadURL(filters);
      } else {
        this.notify.error('Please select valid date range');
      }
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}
