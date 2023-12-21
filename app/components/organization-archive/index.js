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
  @tracked maxDate = dayjs(Date.now()).toDate();
  @tracked archiveListRef = {};

  datepickerOptions = [
    'last7Days',
    'last30Days',
    'last3Months',
    'last6Months',
    'lastYear',
  ];

  tiggerGenerateArchive = task(async () => {
    try {
      const requestParams = {};

      if (this.startDate) {
        const startDateObj = dayjs(this.startDate);

        // model serializer expects native date object;
        requestParams['from_date'] = startDateObj
          .set('hour', 0)
          .set('minute', 0)
          .set('second', 0)
          .toDate();
      }

      if (this.endDate) {
        let endDateObj = dayjs(this.endDate);
        const now = dayjs();

        const isBeforeNow = endDateObj.isBefore(now, 'day');

        // model serializer expects native date object;
        requestParams['to_date'] = endDateObj
          .set('hour', isBeforeNow ? 23 : now.hour())
          .set('minute', isBeforeNow ? 59 : now.minute())
          .set('second', isBeforeNow ? 59 : 0)
          .toDate();
      }

      const archiveRecord = await this.store.createRecord(
        'organization-archive',
        {
          fromDate: requestParams['from_date'],
          toDate: requestParams['to_date'],
        }
      );

      await archiveRecord.save();

      this.archiveListRef.reloadArchiveList();

      this.realtime.incrementProperty('OrganizationArchiveCounter');

      this.notify.success(this.tArchiveSuccess);
    } catch (err) {
      this.notify.error(this.tArchiveError);
    }
  });

  @action
  setDuration({ date }) {
    this.startDate = date.start;
    this.endDate = date.end;
  }

  @action
  clearSelectedDatePickerDates(event) {
    event.stopPropagation();

    this.startDate = null;
    this.endDate = null;
  }
}
