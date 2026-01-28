import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import dayjs from 'dayjs';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import { OrganizationArchiveType } from 'irene/models/organization-archive';
import type OrganizationService from 'irene/services/organization';
import type RealtimeService from 'irene/services/realtime';
import type AnalyticsService from 'irene/services/analytics';
import type { CalendarOnSelectFunc, RangeDateObject } from '../ak-date-picker';

export interface ArchiveListRef {
  reloadArchiveList?: () => void;
}

type ArchiveTypeOption = {
  label: string;
  description: string;
  value: OrganizationArchiveType;
};

export default class OrganizationArchiveComponent extends Component {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare realtime: RealtimeService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  @tracked startDate: Date | null = null;
  @tracked endDate: Date | null = null;
  @tracked maxDate = dayjs(Date.now()).toDate();
  @tracked archiveListRef: ArchiveListRef = {};
  @tracked selectedArchiveType: ArchiveTypeOption | null = null;

  datepickerOptions = [
    'last7Days',
    'last30Days',
    'last3Months',
    'last6Months',
    'lastYear',
  ];

  get archiveTypeOptions(): ArchiveTypeOption[] {
    return [
      {
        label: this.intl.t('comprehensive'),
        description: this.intl.t('organizationArchiveComprehensiveDescription'),
        value: OrganizationArchiveType.COMPREHENSIVE,
      },
      {
        label: this.intl.t('latestScan'),
        description: this.intl.t('organizationArchiveLatestScanDescription'),
        value: OrganizationArchiveType.LATEST_SCAN,
      },
    ];
  }

  get isComprehensiveArchiveSelected() {
    return (
      this.selectedArchiveType?.value === OrganizationArchiveType.COMPREHENSIVE
    );
  }

  get isLatestScanArchiveSelected() {
    return (
      this.selectedArchiveType?.value === OrganizationArchiveType.LATEST_SCAN
    );
  }

  get showExportButton() {
    return (
      this.isComprehensiveArchiveSelected || this.isLatestScanArchiveSelected
    );
  }

  @action
  setArchiveType(selection: ArchiveTypeOption) {
    this.selectedArchiveType = selection;
  }

  @action
  setDuration(...args: Parameters<CalendarOnSelectFunc>) {
    const { date } = args[0] as RangeDateObject;

    this.startDate = date.start;
    this.endDate = date.end;
  }

  @action
  clearSelectedDatePickerDates(event: Event) {
    event.stopPropagation();

    this.startDate = null;
    this.endDate = null;
  }

  @action
  async generateComprehensiveArchive() {
    const requestParams: Partial<Record<'from_date' | 'to_date', Date>> = {};

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
      const endDateObj = dayjs(this.endDate);
      const now = dayjs();

      const isBeforeNow = endDateObj.isBefore(now, 'day');

      // model serializer expects native date object;
      requestParams['to_date'] = endDateObj
        .set('hour', isBeforeNow ? 23 : now.hour())
        .set('minute', isBeforeNow ? 59 : now.minute())
        .set('second', isBeforeNow ? 59 : 0)
        .toDate();
    }

    const archiveRecord = this.store.createRecord('organization-archive', {
      fromDate: requestParams['from_date'],
      toDate: requestParams['to_date'],
    });

    await archiveRecord.save();
  }

  @action
  async generateLatestScanArchive() {
    const archiveAdapter = this.store.adapterFor('organization-archive');

    await archiveAdapter.generateLatestScanArchive();
  }

  triggerGenerateArchive = task(async () => {
    try {
      if (this.isLatestScanArchiveSelected) {
        await waitForPromise(this.generateLatestScanArchive());
      } else {
        await this.generateComprehensiveArchive();
      }

      this.archiveListRef.reloadArchiveList?.();

      this.realtime.incrementProperty('OrganizationArchiveCounter');

      this.notify.success(this.intl.t('organizationArchiveSuccess'));

      this.analytics.track({
        name: 'ORGANIZATION_ARCHIVE_EVENT',
        properties: {
          feature: 'organization_archive_excel',
        },
      });
    } catch (err) {
      this.notify.error(this.intl.t('organizationArchiveFailed'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationArchive: typeof OrganizationArchiveComponent;
  }
}
