import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type ConfigurationService from 'irene/services/configuration';
import type OrganizationService from 'irene/services/organization';

interface FileReportDrawerSignature {
  Args: {
    file: FileModel;
    open?: boolean;
    onClose: () => void;
  };
}

export default class FileReportDrawerComponent extends Component<FileReportDrawerSignature> {
  @service declare intl: IntlService;
  @service declare configuration: ConfigurationService;
  @service declare organization: OrganizationService;

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  get reportGroupList() {
    return [
      {
        id: 'va-reports',
        title: this.intl.t('fileReport.vaReports'),
        contentComponent: 'file/report-drawer/va-reports' as const,
      },
      {
        id: 'privacy-module-reports',
        title: this.intl.t('fileReport.privacyReport'),
        contentComponent: 'file/report-drawer/privacy-reports' as const,

        hideGroup:
          this.orgIsAnEnterprise ||
          this.organization.hideUpsellUIStatus.privacyModule,
      },
      {
        id: 'sbom-reports',
        title: this.intl.t('fileReport.sbomReports'),
        contentComponent: 'file/report-drawer/sbom-reports' as const,

        hideGroup:
          this.orgIsAnEnterprise || this.organization.hideUpsellUIStatus.sbom,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer': typeof FileReportDrawerComponent;
  }
}
