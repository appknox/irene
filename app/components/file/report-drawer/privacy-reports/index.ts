import Component from '@glimmer/component';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

import { PrivacyStatus } from 'irene/models/privacy-project';
import type OrganizationService from 'irene/services/organization';
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
  @service declare router: RouterService;
  @service declare privacyModule: PrivacyModuleService;
  @service declare intl: IntlService;

  constructor(
    owner: unknown,
    args: FileReportDrawerPrivacyReportsSignature['Args']
  ) {
    super(owner, args);

    if (this.privacyIsActive) {
      this.privacyModule.getPrivacyAppStatus(this.file.id);
    }
  }

  get file() {
    return this.args.file;
  }

  get privacyIsActive() {
    return this.organization?.selected?.features?.privacy;
  }

  get failedStatus() {
    return this.privacyModule.privacyStatus === PrivacyStatus.FAILED;
  }

  get inProgressStatus() {
    return this.privacyModule.privacyStatus === PrivacyStatus.IN_PROGRESS;
  }

  get statusInfo() {
    if (this.failedStatus) {
      return {
        label: 'chipStatus.failed',
        color: 'primary' as AkChipColor,
        icon: 'warning',
        text: this.intl.t('privacyModule.failedNote'),
      };
    } else if (this.inProgressStatus) {
      return {
        label: 'chipStatus.inProgress',
        color: 'warn' as AkChipColor,
        icon: 'mdi:progress-clock',
        text: this.intl.t('privacyModule.inProgressMessageReport'),
      };
    }
    return null;
  }

  willDestroy(): void {
    super.willDestroy();

    this.privacyModule.trackerRequest = null;
    this.privacyModule.permissionRequest = null;
    this.privacyModule.privacyStatus = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::PrivacyReports': typeof FileReportDrawerPrivacyReportsComponent;
    'file/report-drawer/privacy-reports': typeof FileReportDrawerPrivacyReportsComponent;
  }
}
