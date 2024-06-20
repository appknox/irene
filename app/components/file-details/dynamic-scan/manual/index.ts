import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type FileModel from 'irene/models/file';

export interface FileDetailsDastManualSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDastManual extends Component<FileDetailsDastManualSignature> {
  @service declare intl: IntlService;
  @tracked isFullscreenView = false;

  @action
  handleFullscreenClose() {
    this.isFullscreenView = false;
  }

  @action
  toggleFullscreenView() {
    this.isFullscreenView = !this.isFullscreenView;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Manual': typeof FileDetailsDastManual;
  }
}
