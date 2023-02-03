import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import dayjs from 'dayjs';
import { tracked } from '@glimmer/tracking';

export default class OrganizationArchiveComponent extends Component {
  @service intl;
  @service organization;
  @service store;
  @service realtime;
  @service('notifications') notify;

  tArchiveSuccess = this.intl.t('organizationArchiveSuccess');
  tArchiveError = this.intl.t('organizationArchiveFailed');

  @tracked startDate = null;
  @tracked endDate = null;
  @tracked maxDate = dayjs(Date.now());

  datepickerOptions = [
    'today',
    'last7Days',
    'last30Days',
    'last3Months',
    'last6Months',
    'lastYear',
  ];

  @task
  *tiggerGenerateArchive() {
    try {
      const startDateObj = this.startDate;
      const endDateObj = this.endDate;
      const requestParams = {};

      if (startDateObj) {
        startDateObj.set({
          h: 0,
          m: 0,
          s: 0,
        });
        requestParams['from_date'] = startDateObj.toISOString();
      }
      if (endDateObj) {
        const now = dayjs();
        if (endDateObj.isBefore(now, 'day')) {
          endDateObj.set({
            h: 23,
            m: 59,
            s: 59,
          });
        } else {
          endDateObj.set({
            h: now.hour(),
            m: now.minute(),
            s: 0,
          });
        }
        requestParams['to_date'] = endDateObj.toISOString();
      }

      const archiveRecord = yield this.store.createRecord(
        'organization-archive',
        {
          fromDate: requestParams['from_date'],
          toDate: requestParams['to_date'],
        }
      );

      yield archiveRecord.save();

      this.realtime.incrementProperty('OrganizationArchiveCounter');

      this.notify.success(this.tArchiveSuccess);
    } catch (err) {
      this.notify.error(this.tArchiveError);
    }
  }

  @action
  setDuration(dates) {
    this.startDate = dates[0];
    this.endDate = dates[1];
  }

  @action
  clearSelectedDatePickerDates(event) {
    event.stopPropagation();

    this.startDate = null;
    this.endDate = null;
  }
}
