import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type DynamicscanModel from 'irene/models/dynamicscan';

import type FileModel from 'irene/models/file';
import parseError from 'irene/utils/parse-error';

export interface FileDetailsDastManualSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDastManual extends Component<FileDetailsDastManualSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked isFullscreenView = false;
  @tracked dynamicScan: DynamicscanModel | null = null;

  constructor(owner: unknown, args: FileDetailsDastManualSignature['Args']) {
    super(owner, args);

    this.fetchDynamicscan.perform();
  }

  get showStatusChip() {
    if (this.dynamicScan?.isDynamicStatusReady) {
      return false;
    } else if (
      this.dynamicScan?.isDynamicStatusNoneOrError ||
      this.dynamicScan?.isDynamicStatusInProgress
    ) {
      return true;
    }

    return false;
  }

  get showActionButton() {
    if (
      this.dynamicScan?.isDynamicStatusReady ||
      this.dynamicScan?.isDynamicStatusError
    ) {
      return true;
    } else if (this.dynamicScan?.isDynamicStatusInProgress) {
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
