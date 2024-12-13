import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

import ENV from 'irene/config/environment';
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
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;

  @tracked showDynamicScanDrawer = false;

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

  dynamicShutdown = task({ drop: true }, async () => {
    this.args.dynamicScan?.setShuttingDown();

    try {
      await this.args.dynamicScan?.destroyRecord();

      this.args.onScanShutdown?.();
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
