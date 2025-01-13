import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import type FileModel from 'irene/models/file';
import type OrganizationService from './organization';
import DynamicscanModel from 'irene/models/dynamicscan';
import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';

export default class DynamicScanService extends Service {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked manualScan: DynamicscanModel | null = null;
  @tracked automatedScan: DynamicscanModel | null = null;
  @tracked scheduledScan: DynamicscanModel | null = null;

  currentFile: FileModel | null = null;

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
    // save file reference
    this.currentFile = file;

    this.fetchLatestManualScan.perform(file);
    this.fetchLatestAutomatedScan.perform(file);

    if (this.isSuperUserAndAutomationEnabled) {
      this.fetchLatestScheduledScan.perform(file);
    }
  }

  @action
  resetScans() {
    this.manualScan = null;
    this.automatedScan = null;
    this.scheduledScan = null;
    this.currentFile = null;
  }

  @action
  async fetchLatestScan(
    file: FileModel,
    mode: number,
    isScheduledScan = false
  ) {
    try {
      return await file.getLastDynamicScan(file.id, mode, isScheduledScan);
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));

      return null;
    }
  }

  fetchLatestManualScan = task(async (file: FileModel) => {
    this.manualScan = await this.fetchLatestScan(
      file,
      ENUMS.DYNAMIC_MODE.MANUAL
    );
  });

  fetchLatestAutomatedScan = task(async (file: FileModel) => {
    this.automatedScan = await this.fetchLatestScan(
      file,
      ENUMS.DYNAMIC_MODE.AUTOMATED
    );
  });

  fetchLatestScheduledScan = task(async (file: FileModel) => {
    this.scheduledScan = await this.fetchLatestScan(
      file,
      ENUMS.DYNAMIC_MODE.AUTOMATED,
      true
    );
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

    // Check if we're on the correct route and have a current file
    const isOnDynamicScanRoute = this.router.currentRouteName.includes(
      'authenticated.dashboard.file.dynamic-scan'
    );

    if (!this.currentFile || !isOnDynamicScanRoute) {
      return;
    }

    // Check if the scan belongs to the current file
    const isSameFile = model.file.get('id') === this.currentFile.id;

    if (!isSameFile) {
      return;
    }

    // Update manual scan if conditions are met
    if (
      model.mode === ENUMS.DYNAMIC_MODE.MANUAL &&
      model.id !== this.manualScan?.id
    ) {
      this.manualScan = model;
      return;
    }

    // Update automated scan if conditions are met
    if (
      model.mode === ENUMS.DYNAMIC_MODE.AUTOMATED &&
      model.id !== this.automatedScan?.id
    ) {
      this.automatedScan = model;
    }
  });
}
