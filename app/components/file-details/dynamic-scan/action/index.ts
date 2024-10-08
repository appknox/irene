import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import type FileModel from 'irene/models/file';
import type PollService from 'irene/services/poll';
import type DynamicscanModel from 'irene/models/dynamicscan';

export interface DynamicScanActionSignature {
  Args: {
    onScanShutdown?: () => void;
    file: FileModel;
    dynamicScanText: string;
    isAutomatedScan?: boolean;
    dynamicScan: DynamicscanModel | null;
  };
}

export default class DynamicScanActionComponent extends Component<DynamicScanActionSignature> {
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service declare poll: PollService;

  @tracked showDynamicScanDrawer = false;

  constructor(owner: unknown, args: DynamicScanActionSignature['Args']) {
    super(owner, args);

    this.pollDynamicStatus();
  }

  get file() {
    return this.args.file;
  }

  get projectPlatform() {
    return this.file.project.get('platform');
  }

  get profileId() {
    return this.file.profile.get('id');
  }

  @action
  openDynamicScanDrawer() {
    triggerAnalytics(
      'feature',
      ENV.csb['dynamicScanBtnClick'] as CsbAnalyticsFeatureData
    );

    this.showDynamicScanDrawer = true;
  }

  @action
  closeDynamicScanDrawer() {
    this.showDynamicScanDrawer = false;
  }

  @action
  pollDynamicStatus() {
    const isDynamicReady = this.file.isDynamicStatusReady;

    if (isDynamicReady) {
      return;
    }

    if (!this.file.id) {
      return;
    }

    const stopPoll = this.poll.startPolling(
      () =>
        this.file
          ?.reload()
          .then((f) => {
            if (
              f.dynamicStatus === ENUMS.DYNAMIC_STATUS.NONE ||
              f.dynamicStatus === ENUMS.DYNAMIC_STATUS.READY
            ) {
              stopPoll();
            }
          })
          .catch(() => stopPoll()),
      5000
    );
  }

  @action shutdownDynamicScan() {
    this.dynamicShutdown.perform();
    this.args.onScanShutdown?.();
  }

  dynamicShutdown = task({ drop: true }, async () => {
    this.file.setShuttingDown();

    const dynamicUrl = [ENV.endpoints['dynamic'], this.file.id].join('/');

    try {
      await this.ajax.delete(dynamicUrl);

      if (!this.isDestroyed) {
        this.pollDynamicStatus();
      }
    } catch (error) {
      this.file.setNone();

      this.notify.error((error as AdapterError).payload.error);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action': typeof DynamicScanActionComponent;
  }
}
