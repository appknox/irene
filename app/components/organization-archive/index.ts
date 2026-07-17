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

  readonly MAX_DATE_RANGE_YEARS = 2;

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

  get showDatePicker() {
    return (
      this.isComprehensiveArchiveSelected || this.isLatestScanArchiveSelected
    );
  }

  get showExportButton() {
    return this.showDatePicker;
  }

  @action
  setArchiveType(selection: ArchiveTypeOption) {
    this.selectedArchiveType = selection;
    this.startDate = null;
    this.endDate = null;
  }

  @action
  setDuration(...args: Parameters<CalendarOnSelectFunc>) {
    const { date } = args[0] as RangeDateObject;

    // Validate date range for both archive types (max 2 years)
    if (date.start && date.end) {
      const startDate = dayjs(date.start);
      const endDate = dayjs(date.end);

      const maxAllowedEndDate = startDate.add(
        this.MAX_DATE_RANGE_YEARS,
        'years'
      );

      if (endDate.isAfter(maxAllowedEndDate)) {
        this.notify.error(this.intl.t('organizationArchiveDateRangeExceeded'));

        // Clear both dates when validation fails
        this.startDate = null;
        this.endDate = null;

        return;
      }
    }

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
      requestParams['from_date'] = startDateObj.startOf('day').toDate();
    }

    if (this.endDate) {
      const now = dayjs();
      const endDateObj = dayjs(this.endDate);
      const isBeforeNow = endDateObj.isBefore(now, 'day');

      // model serializer expects native date object;
      const requestToDate = isBeforeNow
        ? endDateObj.endOf('day')
        : now.startOf('minute');

      requestParams['to_date'] = requestToDate.toDate();
    }

    const archiveRecord = this.store.createRecord('organization-archive', {
      fromDate: requestParams['from_date'],
      toDate: requestParams['to_date'],
      archiveType: OrganizationArchiveType.COMPREHENSIVE,
    });

    await archiveRecord.save();
  }

  @action
  async generateLatestScanArchive() {
    const requestParams: Partial<Record<'from_date' | 'to_date', Date>> = {};

    if (this.startDate) {
      const startDateObj = dayjs(this.startDate);

      requestParams['from_date'] = startDateObj.startOf('day').toDate();
    }

    if (this.endDate) {
      const now = dayjs();
      const endDateObj = dayjs(this.endDate);
      const isBeforeNow = endDateObj.isBefore(now, 'day');

      const requestToDate = isBeforeNow
        ? endDateObj.endOf('day')
        : now.startOf('minute');

      requestParams['to_date'] = requestToDate.toDate();
    }

    const archiveAdapter = this.store.adapterFor('organization-archive');

    await archiveAdapter.generateLatestScanArchive(
      requestParams['from_date'],
      requestParams['to_date']
    );
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
    } catch {
      this.notify.error(this.intl.t('organizationArchiveFailed'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationArchive: typeof OrganizationArchiveComponent;
  }
}
