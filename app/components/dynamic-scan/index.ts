import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import poll from 'irene/services/poll';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';
import FileModel from 'irene/models/file';

export interface DynamicScanSignature {
  Args: {
    vncViewer?: boolean;
    onScanShutdown?: () => void;
    file: FileModel;
    dynamicScanText: string;
  };
}

export default class DynamicScanComponent extends Component<DynamicScanSignature> {
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;

  @tracked showDynamicScanModal = false;

  constructor(owner: unknown, args: DynamicScanSignature['Args']) {
    super(owner, args);

    this.pollDynamicStatus();
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
    const file = this.args.file;
    const isDynamicReady = file.isDynamicStatusReady;

    if (isDynamicReady) {
      return;
    }

    if (!file.id) {
      return;
    }

    const stopPoll = poll(
      () =>
        file
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
    const file = this.args.file;

    file.setShuttingDown();

    const dynamicUrl = [ENV.endpoints['dynamic'], file.id].join('/');

    try {
      await this.ajax.delete(dynamicUrl);

      this.args.onScanShutdown?.();

      if (!this.isDestroyed) {
        this.pollDynamicStatus();
      }
    } catch (error) {
      file.setNone();

      this.notify.error((error as AdapterError).payload.error);
    }
  });
}
