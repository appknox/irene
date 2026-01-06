import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type OrganizationService from './organization';
import type PollService from './poll';
import type MeService from './me';

export default class DynamicScanService extends Service {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service declare poll: PollService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked scheduledScan: DynamicscanModel | null = null;

  get isSuperUserAndAutomationEnabled() {
    return (
      this.isSecurityEnabled &&
      this.organization.selected?.features?.dynamicscan_automation
    );
  }

  get isSecurityEnabled() {
    return this.me.org?.has_security_permission;
  }

  get showScheduledScan() {
    return this.isSuperUserAndAutomationEnabled && this.scheduledScan;
  }

  get selectedOrganizationId() {
    return this.organization.selected?.id;
  }

  /**
   * Fetches the latest scans for a given file, including manual, automated, and scheduled scans.
   * This method is called from the `authenticated.dashboard.file.dynamic-scan` root component.
   *
   * @param file - The file for which to fetch the latest scans.
   */
  @action
  fetchLatestScans(file: FileModel) {
    if (this.isSuperUserAndAutomationEnabled) {
      this.fetchLatestScheduledScan.perform(file);
    }
  }

  @action
  resetScans() {
    this.scheduledScan = null;
  }

  /**
   * Checks if the dynamic scan is not started, completed, ready, running, or in an error state.
   *
   * @param dynamicScan - The dynamic scan to check.
   * @returns True if the dynamic scan is not started, completed, ready, running, or in an error state, false otherwise.
   */
  @action
  checkAndStopStatusPoll(dynamicScan?: DynamicscanModel | null) {
    const isCompleted = dynamicScan?.get('isCompleted');
    const isReadyOrRunning = dynamicScan?.get('isReadyOrRunning');
    const isStatusError = dynamicScan?.get('isStatusError');
    const isCancelled = dynamicScan?.get('isCancelled');
    const isNone = dynamicScan?.get('isNone');

    return Boolean(
      isCompleted || isReadyOrRunning || isStatusError || isCancelled || isNone
    );
  }

  /**
   * Polls the status of a dynamic scan and stops polling when a condition is met.
   *
   * @param file - The file for which to poll the dynamic scan status.
   * @param isAutomatedScan - Whether the scan is automated.
   */
  @action
  async pollDynamicScanStatusForSuperUser({
    file,
    isAutomatedScan,
  }: {
    file?: FileModel | null;
    isAutomatedScan?: boolean;
  }) {
    // Only do polling if the file project org id is not the same as the selected organization id
    // This means that the file is being accessed by a superuser
    const filePrjOrgId = file?.get('project')?.get('organization')?.get('id');

    if (filePrjOrgId === this.selectedOrganizationId) {
      return;
    }

    // Retry Attempts
    let attempt = 1;

    const stopPoll = this.poll.startPolling(async () => {
      try {
        // Reload the file to get the latest dynamic scan
        const rFile = await file?.reload();
        let dsScan: DynamicscanModel | null | undefined = null;

        // Reload the last manual and automated dynamic scans
        if (isAutomatedScan) {
          dsScan = await rFile?.getFileLastAutomatedDynamicScan();
        } else {
          dsScan = await rFile?.getFileLastManualDynamicScan();
        }

        // Stop polling if not stopped after 8 checks
        if (attempt === 60) {
          stopPoll();

          return;
        }

        // Increment the attempt
        attempt++;

        // Stop polling if the file dynamic scan is ready, running, cancelled, or in an error state
        if (this.checkAndStopStatusPoll(dsScan)) {
          stopPoll();
        }
      } catch {
        // Stop polling if the file reload is errored
        stopPoll();
      }
    }, 1000);
  }

  fetchLatestScheduledScan = task(async (file: FileModel) => {
    try {
      this.scheduledScan = await file.getLastDynamicScan(
        file.id,
        ENUMS.DYNAMIC_MODE.AUTOMATED,
        true
      );
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}
