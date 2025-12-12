import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import ProjectModel from 'irene/models/project';

interface ProjectListScanStatusesSignature {
  Element: HTMLElement;
  Args: {
    project: ProjectModel;
  };
}

export default class ProjectListScanStatusesComponent extends Component<ProjectListScanStatusesSignature> {
  @service declare intl: IntlService;

  get file() {
    return this.args.project?.get('lastFile');
  }

  get isManualScanDisabled() {
    return !this.args.project?.get('isManualScanAvailable');
  }

  get isManualDone() {
    return this.file?.get('isManualDone');
  }

  get isManualRequested() {
    return this.file?.get('isManualRequested');
  }

  get scanStatuses() {
    return [
      {
        name: this.intl.t('sast'),
        isDone: this.file?.get('isStaticDone'),
      },
      {
        name: this.intl.t('dast'),
        isDone: this.file?.get('isDynamicDone'),
      },
      {
        name: this.intl.t('api'),
        isDone: this.file?.get('isApiDone'),
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::ScanStatuses': typeof ProjectListScanStatusesComponent;
  }
}
