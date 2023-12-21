/* eslint-disable ember/no-array-prototype-extensions */
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import { task } from 'ember-concurrency';

export default class PartnerExportStatsComponent extends Component {
  @service store;
  @service('notifications') notify;

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
  updateDateRange({ date }) {
    this.dateRange = [date.start, date.end];
  }

  @action
  async downloadCSV() {
    const url = await this.fetchDownloadUrl.perform();
    if (url?.csv) {
      var element = document.createElement('a');
      element.setAttribute('href', url.csv);
      element.setAttribute('download', 'dashboard_analytics.csv');
      element.setAttribute('style', 'display: none');
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  }

  @task(function* () {
    const startDate = this.dateRange.objectAt(0);
    const endDate = this.dateRange.objectAt(1);
    if (startDate && endDate) {
      const filters = {
        start_timestamp: dayjs(startDate).format(),
        end_timestamp: dayjs(endDate).format(),
      };

      return yield this.store
        .adapterFor('partner/analytic')
        .getDownloadURL(filters);
    } else {
      this.notify.error('Please select valid date range');
    }
  })
  fetchDownloadUrl;
}
