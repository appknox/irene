import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';
import type { DevicePreferenceContext } from 'irene/components/project-preferences-old/provider';

export interface FileDetailsDastManualSignature {
  Args: {
    file: FileModel;
    profileId: number;
    dpContext: DevicePreferenceContext;
  };
}

export default class FileDetailsDastManual extends Component<FileDetailsDastManualSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('browser/window') declare window: Window;
  @service('notifications') declare notify: NotificationService;

  @tracked isFullscreenView = false;
  @tracked devicePrefObserverRegistered = false;
  @tracked dynamicScan: DynamicscanModel | null = null;

  constructor(owner: unknown, args: FileDetailsDastManualSignature['Args']) {
    super(owner, args);

    // TODO: Uncomment when full DAST feature is ready.
    // this.fetchDynamicscan.perform();
  }

  get file() {
    return this.args.file;
  }

  get showStatusChip() {
    if (this.file?.isDynamicStatusReady) {
      return false;
    } else if (
      this.file?.isDynamicStatusNoneOrError ||
      this.file?.isDynamicStatusInProgress
    ) {
      return true;
    }

    return false;
  }

  get showActionButton() {
    if (this.isFullscreenView) {
      return false;
    }

    if (this.file?.isDynamicStatusReady || this.file?.isDynamicStatusError) {
      return true;
    } else if (this.file?.isDynamicStatusInProgress) {
      return false;
    }

    return true;
  }

  @action
  handleFullscreenClose() {
    this.isFullscreenView = false;
  }

  @action
  toggleFullscreenView() {
    this.isFullscreenView = !this.isFullscreenView;
  }

  fetchDynamicscan = task(async () => {
    const id = this.args.profileId;

    try {
      this.dynamicScan = await this.store.findRecord('dynamicscan', id);
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Manual': typeof FileDetailsDastManual;
  }
}
