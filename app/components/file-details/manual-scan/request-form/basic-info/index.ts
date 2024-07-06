import Component from '@glimmer/component';
import { action } from '@ember/object';

import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';
import type ManualscanModel from 'irene/models/manualscan';

export interface FileDetailsManualScanRequestFormBasicInfoSignature {
  Args: {
    file: FileModel;
    manualscan: ManualscanModel | null;
  };
}

export default class FileDetailsManualScanRequestFormBasicInfoComponent extends Component<FileDetailsManualScanRequestFormBasicInfoSignature> {
  get environments() {
    return ENUMS.APP_ENV.CHOICES.slice(0, -1);
  }

  get selectedAppEnvironment() {
    return this.environments.find(
      (it) => it.value === this.args.manualscan?.filteredAppEnv
    );
  }

  get appActions() {
    return ENUMS.APP_ACTION.CHOICES.slice(0, -1);
  }

  get selectedAppAction() {
    return this.appActions.find(
      (it) => it.value === this.args.manualscan?.filteredAppAction
    );
  }

  @action
  selectAppEnvironment({ value }: { value: string }) {
    this.args.manualscan?.set('appEnv', value);
  }

  @action
  handleAppActionChange({ value }: { value: string }) {
    const appAction = parseInt(value);

    this.args.manualscan?.set('appAction', appAction);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ManualScan::RequestForm::BasicInfo': typeof FileDetailsManualScanRequestFormBasicInfoComponent;
    'file-details/manual-scan/request-form/basic-info': typeof FileDetailsManualScanRequestFormBasicInfoComponent;
  }
}
