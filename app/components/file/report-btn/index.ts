import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import FileModel from 'irene/models/file';

export interface FileReportBtnSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileReportBtn extends Component<FileReportBtnSignature> {
  @tracked reportDrawerOpen = false;

  get isStaticScanDone() {
    return this.args.file.isStaticDone;
  }

  get disableReportBtn() {
    return !this.isStaticScanDone;
  }

  @action openReportDrawer() {
    if (this.disableReportBtn) {
      return;
    }

    this.reportDrawerOpen = true;
  }

  @action closeReportDrawer() {
    this.reportDrawerOpen = false;
  }
}
