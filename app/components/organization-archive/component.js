import Component from '@ember/component';
import {
  task
} from 'ember-concurrency';
import {
  on
} from '@ember/object/evented';
import {
  inject as service
} from '@ember/service';
import {
  t
} from 'ember-intl';
import dayjs from 'dayjs';

export default Component.extend({
  organization: service('organization'),

  tArchiveSuccess: t('organizationArchiveSuccess'),
  tArchiveError: t('organizationArchiveFailed'),

  startDate: null,
  endDate: null,
  maxDate: dayjs(Date.now()),

  datepickerOptions: [
    'clear',
    'today',
    'last3Months',
    'last6Months',
    'lastYear'
  ],

  tiggerGenerateArchive: task(function* () {
    const startDateObj = this.get('startDate');
    const endDateObj = this.get('endDate');
    const requestParams = {};

    if (startDateObj) {
      startDateObj.set({
        h: 0,
        m: 0,
        s: 0
      });
      requestParams['from_date'] = startDateObj.toISOString();
    }
    if (endDateObj) {
      const now = dayjs();
      if (endDateObj.isBefore(now, 'day')) {
        endDateObj.set({
          h: 23,
          m: 59,
          s: 59
        });
      } else {
        endDateObj.set({
          h: now.hour(),
          m: now.minute(),
          s: 0
        });
      }
      requestParams['to_date'] = endDateObj.toISOString();
    }

    const archiveRecord = yield this.store.createRecord('organization-archive', {
      fromDate: requestParams['from_date'],
      toDate: requestParams['to_date']
    });
    yield archiveRecord.save();

    this.get('realtime').incrementProperty('OrganizationArchiveCounter');
  }).evented(),

  onGenerateArchiveSuccess: on('tiggerGenerateArchive:succeeded', function () {
    this.get('notify').success(this.get('tArchiveSuccess'));
  }),

  onGenerateArchiveError: on('tiggerGenerateArchive:errored', function () {
    this.get('notify').error(this.get('tArchiveError'));
  }),

  actions: {
    setDuration(dates) {
      this.set('startDate', dates[0]);
      this.set('endDate', dates[1]);
    }
  }
});
