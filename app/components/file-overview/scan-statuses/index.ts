import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import FileModel from 'irene/models/file';

interface FileOverviewScanStatusesSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
  };
}

export default class FileOverviewScanStatusesComponent extends Component<FileOverviewScanStatusesSignature> {
  @service declare intl: IntlService;

  get file() {
    return this.args.file;
  }

  get isManualScanDisabled() {
    return !this.file?.project?.get('isManualScanAvailable');
  }

  get scanStatuses() {
    return [
      {
        name: this.intl.t('static'),
        isDone: this.file?.isStaticDone,
      },
      {
        name: this.intl.t('dynamic'),
        isDone: this.file?.isDynamicDone,
      },
      {
        name: this.intl.t('api'),
        isDone: this.file?.isApiDone,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileOverview::ScanStatuses': typeof FileOverviewScanStatusesComponent;
  }
}
