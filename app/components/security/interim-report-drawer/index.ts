/* eslint-disable ember/no-observers */
import dayjs from 'dayjs';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { addObserver, removeObserver } from '@ember/object/observers';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from 'ember-data/store';

import parseError from 'irene/utils/parse-error';
import type SecurityFileModel from 'irene/models/security/file';
import type InterimReportModel from 'irene/models/interim-report';
import type RealtimeService from 'irene/services/realtime';

interface SecurityInterimReportDrawerSignature {
  Args: {
    file: SecurityFileModel;
    open: boolean;
    onClose: () => void;
  };
}

export interface InterimReportDetails {
  interimReport: InterimReportModel;
  fileId: string;
  type: 'pdf';
  primaryText: string;
  reportType: 'interim';
  secondaryText: string;
  copyText: string;
  iconComponent: 'ak-svg/pdf-report';
  generatedOnDateTime: string;
  generatedBy: string;
}

export default class SecurityInterimReportDrawer extends Component<SecurityInterimReportDrawerSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare realtime: RealtimeService;

  @tracked interimReport: InterimReportModel | null = null;

  constructor(
    owner: unknown,
    args: SecurityInterimReportDrawerSignature['Args']
  ) {
    super(owner, args);

    this.initializeDrawer();
  }

  get isInterimReportGenerated() {
    return !!this.interimReport?.isGenerated;
  }

  get isInterimReportGenerating() {
    return (
      this.generateInterimReportTask.isRunning ||
      !!this.interimReport?.isGenerating
    );
  }

  get latestInterimReport(): InterimReportDetails | null {
    const report = this.interimReport;

    if (!report) {
      return null;
    }

    const secondaryText = report.reportPassword
      ? `Password: ${report.reportPassword}`
      : 'No password required';

    return {
      interimReport: report,
      fileId: this.args.file.id,
      type: 'pdf' as const,
      primaryText: 'Interim Report (pdf)',
      reportType: 'interim' as const,
      secondaryText,
      copyText: report.reportPassword,
      iconComponent: 'ak-svg/pdf-report' as const,
      generatedOnDateTime: report.createdOn
        ? dayjs(report.createdOn).format('D MMMM YYYY h:mm A')
        : '',
      generatedBy: report.generatedBy,
    };
  }

  get reportDetails() {
    return this.latestInterimReport;
  }

  get reportGroupList() {
    return [
      {
        id: 'interim-report',
        title: 'Report',
        contentComponent: 'security/interim-report-drawer/report-item' as const,
      },
    ];
  }

  @action
  handleClose() {
    this.args.onClose();
  }

  @action
  observeInterimReportCounter() {
    this.fetchInterimReport.perform();
  }

  @action
  initializeDrawer() {
    addObserver(
      this.realtime,
      'InterimReportCounter',
      this,
      this.observeInterimReportCounter
    );

    this.fetchInterimReport.perform();
  }

  @action
  removeInterimReportCounterObserver() {
    removeObserver(
      this.realtime,
      'InterimReportCounter',
      this,
      this.observeInterimReportCounter
    );
  }

  @action
  generateInterimReport() {
    this.generateInterimReportTask.perform();
  }

  fetchInterimReport = task(async () => {
    try {
      this.interimReport = await waitForPromise(
        this.store.queryRecord('interim-report', {
          fileId: this.args.file.id,
        })
      );
    } catch (e) {
      const error = e as AdapterError;

      if (error.errors?.[0]?.status !== '404') {
        this.notify.error(parseError(e));
      }
    }
  });

  generateInterimReportTask = task(async () => {
    try {
      const newReport = this.store.createRecord('interim-report', {
        fileId: this.args.file.id,
      });

      await waitForPromise(newReport.save());
      await this.fetchInterimReport.perform();

      if (this.interimReport) {
        await waitForPromise(this.interimReport.generateReport());
        await waitForPromise(this.interimReport.reload());
      }

      this.notify.success(
        'Generating interim report. This may take a few minutes...'
      );
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  willDestroy() {
    this.removeInterimReportCounterObserver();
    super.willDestroy();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::InterimReportDrawer': typeof SecurityInterimReportDrawer;
  }
}
