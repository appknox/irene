import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import parseError from 'irene/utils/parse-error';

export default class PartnerExportStatsComponent extends Component {
  @service store;
  @service('notifications') notify;

  @tracked dateRange = [];

  maxDate = dayjs(Date.now());

  datepickerOptions = [
    'clear',
    'last7Days',
    'last30Days',
    'thisMonth',
    'last6Months',
    'lastYear',
  ];

  @action
  updateDateRange(range) {
    this.dateRange = range;
  }

  @action
  async downloadCSV() {
    try {
      const url = await this.fetchDownloadUrl.perform();
      var element = document.createElement('a');
      element.setAttribute('href', url.csv);
      element.setAttribute('download', 'dashboard_analytics.csv');
      element.setAttribute('style', 'display: none');
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      this.notify.error(parseError(err));
    }
  }

  @task(function* () {
    const startDate = this.dateRange.objectAt(0);
    const endDate = this.dateRange.objectAt(1);
    if (startDate && endDate) {
      const filters = {
        start_timestamp: dayjs(startDate).toISOString(),
        end_timestamp: dayjs(endDate).toISOString(),
      };
      return yield this.store
        .adapterFor('partner/analytic')
        .getDownloadURL(filters);
    } else {
      throw new Error('Please select valid date range');
    }
  })
  fetchDownloadUrl;
}
