import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';

interface KnoxIqProjectCardScanStatusesSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
    project?: ProjectModel | null;
  };
}

export default class KnoxIqProjectCardScanStatusesComponent extends Component<KnoxIqProjectCardScanStatusesSignature> {
  @service declare intl: IntlService;

  get file() {
    return this.args.file;
  }

  get isManualScanDisabled() {
    return !this.args.project?.isManualScanAvailable;
  }

  get scanStatuses() {
    return [
      {
        name: this.intl.t('sast'),
        isDone: this.file?.isStaticDone,
      },
      {
        name: this.intl.t('dast'),
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
    'KnoxIq::ProjectCard::ScanStatuses': typeof KnoxIqProjectCardScanStatusesComponent;
  }
}
