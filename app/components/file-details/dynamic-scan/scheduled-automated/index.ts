import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';
import type DynamicScanService from 'irene/services/dynamic-scan';
import type FileModel from 'irene/models/file';
import type IreneAjaxService from 'irene/services/ajax';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type EventBusService from 'irene/services/event-bus';

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
  @service declare eventBus: EventBusService;
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

    // Handle websocket dynamic scan messages
    this.eventBus.on(
      'ws:dynamicscan:update',
      this,
      this.handleDynamicScanUpdate
    );
  }

  @tracked showNotifyUserModal = false;
  @tracked scanIsAlreadyCompleted = false;

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
    return this.doNotifyUserOfStatus.isRunning;
  }

  // cannot start from here in scheduled automated
  handleScanStart() {}

  // handle the scan shutdown will no longer be needed as the websocket event will handle it
  handleScanShutdown() {}

  @action closeShowNotifyUserModal() {
    this.showNotifyUserModal = false;
  }

  @action handleShowNotifyUserModal() {
    this.showNotifyUserModal = true;
  }

  /**
   * We use the websocket event to handle the scan shutdown because
   * the onScanShutdown action is never called from the FileDetails::DynamicScan::Action component
   * as the "onScanShutdown" action logic is never reached due to the component being removed as the websocket
   * receives the dynamic scan shutting down event immediately after the action button is clicked.
   */
  @action handleDynamicScanUpdate(dynamicscan: DynamicscanModel) {
    // Only handle the update if the dynamic scan id matches the current dynamic scan
    if (dynamicscan.id !== this.dynamicScan?.id) {
      return;
    }

    // First completion status received
    // This is to fix the problem of the scan status going from completed to shutting down
    //  and back again
    if (dynamicscan.isCompleted) {
      this.scanIsAlreadyCompleted = true;
    }

    // Set the scan status to completed if we have received a completed status originally
    if (this.scanIsAlreadyCompleted) {
      this.dynamicScan?.set(
        'status',
        ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED
      );
    }

    // Handle the show notify user modal logic
    if (dynamicscan.isCompleted) {
      this.handleShowNotifyUserModal();
    }
  }

  @action confirmNotifyUserOfCompletion(confirmation: boolean) {
    if (!confirmation) {
      this.completeScanShutdown();

      return;
    }

    // Notify user of completion since this function is only called when the scan is completed
    this.doNotifyUserOfStatus.perform();
  }

  @action async completeScanShutdown() {
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
      const errorMsg = parseError(
        error,
        this.intl.t('modalCard.scheduledAutomatedNotifyUser.errorMsg')
      );

      this.notify.error(errorMsg);
    }
  });

  willDestroy() {
    super.willDestroy();

    this.eventBus.off(
      'ws:dynamicscan:update',
      this,
      this.handleDynamicScanUpdate
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::ScheduledAutomated': typeof FileDetailsDynamicScanScheduledAutomatedComponent;
  }
}
