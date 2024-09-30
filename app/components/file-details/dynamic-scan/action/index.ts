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
    const isDynamicReady = this.args.dynamicScan?.isDynamicStatusReady;

    if (isDynamicReady) {
      return;
    }

    if (!this.file.id) {
      return;
    }

    const stopPoll = this.poll.startPolling(
      () =>
        this.args.dynamicScan
          ?.reload()
          .then((ds) => {
            if (
              ds.status === ENUMS.DYNAMIC_STATUS.NONE ||
              ds.status === ENUMS.DYNAMIC_STATUS.READY
            ) {
              stopPoll();
            }
          })
          .catch(() => stopPoll()),
      5000
    );
  }

  dynamicShutdown = task({ drop: true }, async () => {
    this.args.dynamicScan?.setShuttingDown();

    const dynamicUrl = [ENV.endpoints['dynamicscans'], this.profileId].join(
      '/'
    );

    try {
      await this.ajax.delete(dynamicUrl);

      this.args.onScanShutdown?.();

      if (!this.isDestroyed) {
        this.pollDynamicStatus();
      }
    } catch (error) {
      this.args.dynamicScan?.setNone();

      this.notify.error((error as AdapterError).payload.error);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action': typeof DynamicScanActionComponent;
  }
}
