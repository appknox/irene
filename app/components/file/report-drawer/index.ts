import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';

import FileModel from 'irene/models/file';

interface FileReportDrawerSignature {
  Args: {
    file: FileModel;
    open?: boolean;
    onClose: () => void;
  };
}

export default class FileReportDrawerComponent extends Component<FileReportDrawerSignature> {
  @service declare intl: IntlService;

  @tracked activeReportId = 'va-reports';

  get reportGroupList() {
    return [
      {
        id: 'va-reports',
        title: this.intl.t('fileReport.vaReports'),
        expanded: true,
        contentComponent: 'file/report-drawer/va-reports' as const,
      },
    ];
  }

  @action onReportGroupClick(id: string) {
    this.activeReportId = id;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer': typeof FileReportDrawerComponent;
  }
}
