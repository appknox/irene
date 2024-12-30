import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import type FileModel from 'irene/models/file';
import type DynamicscanModel from 'irene/models/dynamicscan';

export interface DynamicScanActionSignature {
  Args: {
    onScanShutdown?: () => void;
    onScanStart: (dynamicscan: DynamicscanModel) => void;
    file: FileModel;
    dynamicScanText: string;
    isAutomatedScan?: boolean;
    dynamicScan: DynamicscanModel | null;
  };
}

export default class DynamicScanActionComponent extends Component<DynamicScanActionSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked showDynamicScanDrawer = false;

  get file() {
    return this.args.file;
  }

  get projectPlatform() {
    return this.file.project.get('platform');
  }

  get profileId() {
    return this.file.profile.get('id') as string;
  }

  get dynamicScanActionButton() {
    if (this.args.dynamicScan?.isStarting) {
      return {
        icon: 'close',
        text: this.intl.t('cancelScan'),
        testId: 'cancelBtn',
        variant: 'outlined' as const,
        color: 'neutral' as const,
        onClick: () => this.dynamicShutdown.perform(),
        loading: this.dynamicShutdown.isRunning,
      };
    }

    if (this.args.dynamicScan?.isReadyOrRunning) {
      return {
        icon: 'stop-circle',
        text: this.intl.t('stop'),
        testId: 'stopBtn',
        loading: this.dynamicShutdown.isRunning,
        onClick: () => this.dynamicShutdown.perform(),
      };
    }

    if (
      this.args.dynamicScan?.isCompleted ||
      this.args.dynamicScan?.isStatusError
    ) {
      return {
        icon: 'refresh',
        text: this.args.dynamicScanText,
        testId: 'restartBtn',
        onClick: this.openDynamicScanDrawer,
      };
    }

    return {
      icon: 'play-arrow',
      text: this.args.dynamicScanText,
      testId: 'startBtn',
      onClick: this.openDynamicScanDrawer,
    };
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

  dynamicShutdown = task({ drop: true }, async () => {
    try {
      await this.args.dynamicScan?.destroyRecord();

      this.args.onScanShutdown?.();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action': typeof DynamicScanActionComponent;
  }
}
