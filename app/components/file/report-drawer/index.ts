import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import FileModel from 'irene/models/file';
import ConfigurationService from 'irene/services/configuration';

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
        id: 'sbom-reports',
        hideGroup: this.orgIsAnEnterprise,
        title: this.intl.t('fileReport.sbomReports'),
        contentComponent: 'file/report-drawer/sbom-reports' as const,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer': typeof FileReportDrawerComponent;
  }
}
