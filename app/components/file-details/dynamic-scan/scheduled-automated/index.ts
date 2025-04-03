/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { addObserver, removeObserver } from '@ember/object/observers';
import type RouterService from '@ember/routing/router-service';

import parseError from 'irene/utils/parse-error';
import type DynamicScanService from 'irene/services/dynamic-scan';
import type FileModel from 'irene/models/file';
import type IreneAjaxService from 'irene/services/ajax';
import type DynamicscanModel from 'irene/models/dynamicscan';

export interface FileDetailsDynamicScanScheduledAutomatedSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDynamicScanScheduledAutomatedComponent extends Component<FileDetailsDynamicScanScheduledAutomatedSignature> {
  @service declare router: RouterService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service('dynamic-scan') declare dsService: DynamicScanService;

  @tracked notifyUserOfCompletionOrError = false;
  @tracked isPerformingNotifyAction = false;
  @tracked showNotifyUserModal = false;

  get dynamicScan() {
    return this.dsService.scheduledScan;
  }

  get isFetchingDynamicScan() {
    return this.dsService.fetchLatestScheduledScan.isRunning;
  }

  get showStatusChip() {
    return !this.dynamicScan?.isReady;
  }

  get showActionButton() {
    return !this.dynamicScan?.isShuttingDown;
  }

  get triggerUserNotificationEndpoint() {
    return ['notify', this.args.file.id, 'success'].join('/');
  }

  get disableNotifUserModalActions() {
    return this.doNotifyUserOfStatus.isRunning || this.isPerformingNotifyAction;
  }

  // cannot start from here in scheduled automated
  handleScanStart() {}

  @action closeShowNotifyUserModal() {
    this.showNotifyUserModal = false;
  }

  @action handleScanShutdown() {
    this.showNotifyUserModal = true;
  }

  @action confirmNotifyUserOfCompletion(confirmation: boolean) {
    if (confirmation && !this.dynamicScan?.isCompleted) {
      this.notifyUserOfCompletionOrError = true; // To remove observer if registered
      this.isPerformingNotifyAction = true;

      addObserver(
        this.dynamicScan as DynamicscanModel,
        'status',
        this,
        this.notifyUserOfStatus
      );
    } else if (confirmation && this.dynamicScan?.isCompleted) {
      this.isPerformingNotifyAction = true;

      this.doNotifyUserOfStatus.perform();
    } else {
      this.completeScanShutdown();
    }
  }

  @action notifyUserOfStatus() {
    console.log(this.dynamicScan?.status);

    if (this.dynamicScan?.isCompleted) {
      console.log('Notifying!');

      this.doNotifyUserOfStatus.perform();
    }
  }

  @action async completeScanShutdown() {
    this.router.transitionTo(
      'authenticated.dashboard.file.dynamic-scan.automated'
    );

    // this will make showScheduledScan false
    this.dsService.scheduledScan = null;

    this.showNotifyUserModal = false;

    await this.args.file.reload();
  }

  doNotifyUserOfStatus = task(async () => {
    try {
      await this.ajax.post(this.triggerUserNotificationEndpoint, {
        namespace: 'api/hudson-api',
      });

      this.isPerformingNotifyAction = false;
      this.showNotifyUserModal = false;

      this.completeScanShutdown();

      this.notify.success('Customer will be notified of this completion.');
    } catch (error) {
      this.notify.error(
        parseError(error, 'Failed to trigger notification for customer.')
      );
    } finally {
      this.isPerformingNotifyAction = false;
    }
  });

  willDestroy() {
    super.willDestroy();

    if (this.notifyUserOfCompletionOrError) {
      removeObserver(
        this.dynamicScan as DynamicscanModel,
        'status',
        this,
        this.notifyUserOfStatus
      );
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::ScheduledAutomated': typeof FileDetailsDynamicScanScheduledAutomatedComponent;
  }
}
