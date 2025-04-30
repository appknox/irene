/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { addObserver, removeObserver } from '@ember/object/observers';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

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
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('dynamic-scan') declare dsService: DynamicScanService;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanScheduledAutomatedSignature['Args']
  ) {
    super(owner, args);

    // Poll the dynamic scan status if the project org is different from the selected org
    // Only necessary for the case where the file is being accessed by a superuser
    this.dsService.pollDynamicScanStatusForSuperUser({
      file: this.args.file,
      isAutomatedScan: true,
    });
  }

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

  get dynamicScanCompleted() {
    return this.dynamicScan?.isCompleted;
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
    if (!confirmation) {
      this.completeScanShutdown();

      return;
    }

    // Proceed with notification flow
    this.isPerformingNotifyAction = true;

    // If scan is not yet completed
    if (!this.dynamicScanCompleted) {
      this.notifyUserOfCompletionOrError = true; // To remove observer if registered

      addObserver(
        this.dynamicScan as DynamicscanModel,
        'status',
        this,
        this.notifyUserOfStatus
      );
    } else {
      this.doNotifyUserOfStatus.perform();
    }
  }

  @action notifyUserOfStatus() {
    if (this.dynamicScanCompleted) {
      this.doNotifyUserOfStatus.perform();
    }
  }

  @action async completeScanShutdown() {
    this.isPerformingNotifyAction = false;
    this.showNotifyUserModal = false;

    this.router.transitionTo(
      'authenticated.dashboard.file.dynamic-scan.automated'
    );

    // this will make showScheduledScan false
    this.dsService.scheduledScan = null;

    await this.args.file.reload();
  }

  doNotifyUserOfStatus = task(async () => {
    try {
      await this.ajax.post(this.triggerUserNotificationEndpoint, {
        namespace: 'api/hudson-api',
      });

      this.completeScanShutdown();

      this.notify.success(
        this.intl.t('modalCard.scheduledAutomatedNotifyUser.successMsg')
      );
    } catch (error) {
      this.isPerformingNotifyAction = false;

      const errorMsg = parseError(
        error,
        this.intl.t('modalCard.scheduledAutomatedNotifyUser.errorMsg')
      );

      this.notify.error(errorMsg);
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

      this.notifyUserOfCompletionOrError = false;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::ScheduledAutomated': typeof FileDetailsDynamicScanScheduledAutomatedComponent;
  }
}
