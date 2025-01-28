import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type FileModel from 'irene/models/file';
import type OrganizationService from './organization';
import type DynamicscanModel from 'irene/models/dynamicscan';
import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';

export default class DynamicScanService extends Service {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked scheduledScan: DynamicscanModel | null = null;

  get isSuperUserAndAutomationEnabled() {
    return (
      this.organization.isSecurityEnabled &&
      this.organization.selected?.features?.dynamicscan_automation
    );
  }

  get showScheduledScan() {
    return this.isSuperUserAndAutomationEnabled && this.scheduledScan;
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

  /**
   * Checks and updates the scan status for a specific file based on an incoming dynamic scan model.
   *
   * @description
   * This method handles updating the scan status for a file in two modes:
   * - Manual scan (ENUMS.DYNAMIC_MODE.MANUAL)
   * - Automated scan (ENUMS.DYNAMIC_MODE.AUTOMATED)
   *
   * It performs the following key actions:
   * 1. Retrieves the current file record from the store
   * 2. Checks the existing scan model based on the specified mode
   * 3. Reloads the file if the incoming scan ID differs from the existing scan ID
   *
   * @param id - The unique identifier of the incoming scan
   * @param fileId - The identifier of the file being scanned
   * @param mode - The scan mode (manual or automated) from ENUMS.DYNAMIC_MODE
   */
  checkScanInProgressAndUpdate = task(
    async (id: string, fileId: string, mode: number) => {
      let existingModel: DynamicscanModel | null | undefined;

      const file = this.store.peekRecord('file', fileId);

      if (mode === ENUMS.DYNAMIC_MODE.MANUAL) {
        existingModel = file?.get('lastManualDynamicScan')?.content;
      } else if (mode === ENUMS.DYNAMIC_MODE.AUTOMATED) {
        existingModel = file?.get('lastAutomatedDynamicScan')?.content;
      }

      // Update manual scan if conditions are met
      if (id !== existingModel?.id) {
        file?.reload?.();
      }
    }
  );
}
