import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type FileModel from 'irene/models/file';
import type OrganizationService from './organization';
import DynamicscanModel from 'irene/models/dynamicscan';
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
   * Updates the current scan status for a file based on the incoming dynamic scan model.
   *
   * @description
   * This task checks if the incoming scan model belongs to the current file and updates
   * either the manual or automated scan accordingly. It ensures that only the most recent
   * scan for the current file is tracked.
   *
   * @param model - The dynamic scan model to process
   */
  checkScanInProgressAndUpdate = task(async (model: unknown) => {
    // Only process if the model is a DynamicscanModel
    if (!(model instanceof DynamicscanModel)) {
      return;
    }

    let existingModel: DynamicscanModel | null | undefined;

    const file = this.store.peekRecord('file', model.file.get('id') as string);

    if (model.mode === ENUMS.DYNAMIC_MODE.MANUAL) {
      existingModel = file?.get('dsManualScan')?.content;
    } else if (model.mode === ENUMS.DYNAMIC_MODE.AUTOMATED) {
      existingModel = file?.get('dsAutomatedScan')?.content;
    }

    // Update manual scan if conditions are met
    if (model.id !== existingModel?.id) {
      file?.reload?.();
    }
  });
}
