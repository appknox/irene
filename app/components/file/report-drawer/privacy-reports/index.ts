import Component from '@glimmer/component';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import type OrganizationService from 'irene/services/organization';
import type FileModel from 'irene/models/file';

export interface FileReportDrawerPrivacyReportsSignature {
  Args: {
    file: FileModel;
    closeDrawer: () => void;
  };
}

export default class FileReportDrawerPrivacyReportsComponent extends Component<FileReportDrawerPrivacyReportsSignature> {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  constructor(
    owner: unknown,
    args: FileReportDrawerPrivacyReportsSignature['Args']
  ) {
    super(owner, args);
  }

  get file() {
    return this.args.file;
  }

  get privacyIsActive() {
    return this.organization?.selected?.features?.privacy;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::PrivacyReports': typeof FileReportDrawerPrivacyReportsComponent;
    'file/report-drawer/privacy-reports': typeof FileReportDrawerPrivacyReportsComponent;
  }
}
