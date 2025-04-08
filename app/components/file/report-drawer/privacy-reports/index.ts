import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type OrganizationService from 'irene/services/organization';
import type PrivacyReportModel from 'irene/models/privacy-report';
import type FileModel from 'irene/models/file';
import type PrivacyModuleService from 'irene/services/privacy-module';
import type { AkChipColor } from 'irene/components/ak-chip';

export interface FileReportDrawerPrivacyReportsSignature {
  Args: {
    file: FileModel;
    closeDrawer: () => void;
  };
}

export default class FileReportDrawerPrivacyReportsComponent extends Component<FileReportDrawerPrivacyReportsSignature> {
  @service declare organization: OrganizationService;
  @service declare privacyModule: PrivacyModuleService;
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked privacyReport: PrivacyReportModel | null = null;
  @tracked reUpload: boolean = false;

  tPleaseTryAgain: string;

  constructor(
    owner: unknown,
    args: FileReportDrawerPrivacyReportsSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    if (this.privacyIsActive) {
      this.fetchPrivacyReports.perform();
    }
  }

  fetchPrivacyReports = task(async () => {
    try {
      this.privacyReport = await this.store.queryRecord('privacy-report', {
        fileId: this.args.file?.id,
      });
    } catch (e) {
      const error = e as AdapterError;

      if (error.errors?.[0]?.status === '404') {
        this.reUpload = true;
      } else {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  });

  get file() {
    return this.args.file;
  }

  get privacyIsActive() {
    return this.organization?.selected?.features?.privacy;
  }

  get statusInfo() {
    switch (this.privacyReport?.privacyAnalysisStatus) {
      case ENUMS.PM_ANALYSIS_STATUS.FAILED:
        return {
          label: 'chipStatus.failed',
          color: 'primary' as AkChipColor,
          icon: 'warning',
          text: this.intl.t('privacyModule.failedNote'),
        };

      case ENUMS.PM_ANALYSIS_STATUS.IN_PROGRESS:
        return {
          label: 'chipStatus.inProgress',
          color: 'warn' as AkChipColor,
          icon: 'mdi:progress-clock',
          text: this.intl.t('privacyModule.inProgressMessageReport'),
        };

      default:
        return null;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::PrivacyReports': typeof FileReportDrawerPrivacyReportsComponent;
    'file/report-drawer/privacy-reports': typeof FileReportDrawerPrivacyReportsComponent;
  }
}
