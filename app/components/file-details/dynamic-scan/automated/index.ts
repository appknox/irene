import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import type FileModel from 'irene/models/file';

export interface FileDetailsDastAutomatedSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDastAutomated extends Component<FileDetailsDastAutomatedSignature> {
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
    'FileDetails::DynamicScan::Automated': typeof FileDetailsDastAutomated;
  }
}
