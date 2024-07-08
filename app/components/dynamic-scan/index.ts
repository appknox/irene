import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';
import FileModel from 'irene/models/file';
import PollService from 'irene/services/poll';

export interface DynamicScanSignature {
  Args: {
    vncViewer?: boolean;
    onScanShutdown?: () => void;
    file: FileModel;
    dynamicScanText: string;
    isAutomatedScan?: boolean;
  };
}

export default class DynamicScanComponent extends Component<DynamicScanSignature> {
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service declare poll: PollService;

  @tracked showDynamicScanModal = false;

  constructor(owner: unknown, args: DynamicScanSignature['Args']) {
    super(owner, args);

    this.pollDynamicStatus();
  }

  get file() {
    return this.args.file;
  }

  get color() {
    if (this.file.isDynamicStatusInProgress) {
      return 'warn';
    } else if (this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.COMPLETED) {
      return 'success';
    } else if (this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.ERROR) {
      return 'error';
    } else if (this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.NONE) {
      return 'secondary';
    } else if (this.file.isDynamicStatusReady) {
      return 'info';
    }
  }

  get projectPlatform() {
    return this.file.project.get('platform');
  }

  get profileId() {
    return this.file.profile.get('id');
  }

  @action
  openDynamicScanModal() {
    triggerAnalytics(
      'feature',
      ENV.csb['dynamicScanBtnClick'] as CsbAnalyticsFeatureData
    );

    this.showDynamicScanModal = true;
  }

  @action
  closeDynamicScanModal() {
    this.showDynamicScanModal = false;
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
          .reload()
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

  dynamicShutdown = task({ drop: true }, async () => {
    this.file.setShuttingDown();

    const dynamicUrl = [ENV.endpoints['dynamic'], this.file.id].join('/');

    try {
      await this.ajax.delete(dynamicUrl);

      this.args.onScanShutdown?.();

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
    DynamicScan: typeof DynamicScanComponent;
  }
}
