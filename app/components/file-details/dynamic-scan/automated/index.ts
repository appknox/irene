import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type Store from 'ember-data/store';

import {
  getCumulativeDsStatusGroup,
  DsStatusGroup,
  DS_STATUS_GROUP_LABEL,
  getDsStatusGroupForScan,
} from 'irene/utils/ds-status-group';

import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type DsAutomationPreferenceModel from 'irene/models/ds-automation-preference';
import type OrganizationService from 'irene/services/organization';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type LoggerService from 'irene/services/logger';

export interface FileDetailsDastAutomatedSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDastAutomated extends Component<FileDetailsDastAutomatedSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;
  @service declare logger: LoggerService;

  @tracked automationPreference: DsAutomationPreferenceModel | null = null;
  @tracked lastAutomatedDynamicScans: DynamicscanModel[] = [];
  @tracked selectedAutomatedDynamicScan: DynamicscanModel | null = null;

  DS_STATUS_GROUP_DISPLAY_PRIORITY = {
    [DsStatusGroup.RUNNING]: 0,
    [DsStatusGroup.STARTING]: 1,
    [DsStatusGroup.RETRYING]: 1,
    [DsStatusGroup.IN_QUEUE]: 1,
    [DsStatusGroup.COMPLETED]: 2,
    [DsStatusGroup.ERRORED]: 3,
    [DsStatusGroup.CANCELLED]: 4,
    [DsStatusGroup.STOPPING]: 5,
    [DsStatusGroup.NOT_STARTED]: 5,
  };

  constructor(owner: unknown, args: FileDetailsDastAutomatedSignature['Args']) {
    super(owner, args);

    this.getDsAutomationPreference.perform();
    this.getLastAutomatedDynamicScan.perform();
  }

  get file() {
    return this.args.file;
  }

  get isFetchingDynamicScan() {
    return this.getLastAutomatedDynamicScan.isRunning;
  }

  get dynamicscanAutomationFeatureAvailable() {
    return !!this.organization.selected?.features?.dynamicscan_automation;
  }

  get hasMultipleDynamicScans() {
    return this.lastAutomatedDynamicScans.length > 1;
  }

  get dynamicScansHaveAtleastOneUserRole() {
    return this.lastAutomatedDynamicScans.some(
      (ds) => ds.scenarioUserRole !== null
    );
  }

  get nonCompletedDynamicScans() {
    return this.lastAutomatedDynamicScans.filter((ds) => !ds.isCompleted);
  }

  get eachIncompleteDynamicScanIsAutopiloted() {
    return this.nonCompletedDynamicScans.every((ds) => ds.isAutopiloted);
  }

  get eachIncompleteDynamicScanHasMixedEngines() {
    let autopilotedScans = 0;
    let scheduledInternallyScans = 0;

    for (const ds of this.nonCompletedDynamicScans) {
      if (ds.isAutopiloted) {
        autopilotedScans++;
      } else {
        scheduledInternallyScans++;
      }
    }

    return autopilotedScans > 0 && scheduledInternallyScans > 0;
  }

  get selectedScanHasNavigationGraph() {
    return (
      this.selectedAutomatedDynamicScan?.isNavigationGraphGenerated === true
    );
  }

  get cumulativeScanStatus() {
    return getCumulativeDsStatusGroup(
      this.lastAutomatedDynamicScans.map((scan) => scan.status)
    );
  }

  get cumulativeScanStatusText() {
    return this.intl.t(DS_STATUS_GROUP_LABEL[this.cumulativeScanStatus]);
  }

  get selectedScanErrorMessage() {
    if (!this.selectedAutomatedDynamicScan?.isStatusError) {
      return '';
    }

    return this.selectedAutomatedDynamicScan.errorMessage;
  }

  get statusChipTooltipMessage() {
    if (this.cumulativeScanStatus === DsStatusGroup.RETRYING) {
      return this.intl.t('dastAutomation.retryingStatusTooltip');
    }

    return this.selectedScanErrorMessage;
  }

  get navigationGraphRouteModels() {
    return [this.file.id, this.selectedAutomatedDynamicScan?.id ?? ''];
  }

  get showInteractionInfo() {
    return (
      (this.selectedAutomatedDynamicScan?.isStarting ||
        this.selectedAutomatedDynamicScan?.isRunning) &&
      this.selectedAutomatedDynamicScan?.isAutopiloted
    );
  }

  get interactionInfoText() {
    if (this.selectedAutomatedDynamicScan?.isStarting) {
      return this.intl.t('dynamicScanDeviceInteractionStarting');
    }

    return this.intl.t('dynamicScanDeviceInteractionDisabled');
  }

  get showActionButton() {
    const { RUNNING, STOPPING } = DsStatusGroup;
    const status = this.cumulativeScanStatus;

    const isActive = status === RUNNING || status === STOPPING;
    const isStopping = status === STOPPING;

    const selectedIsAutopiloted =
      !!this.selectedAutomatedDynamicScan?.isAutopiloted;

    // Treat the current context as autopiloted when:
    //   - there are multiple scans and all incomplete ones are autopiloted, or
    //   - there are multiple scans with mixed engines and the selected one is
    //     autopiloted, or
    //   - there's a single scan that is autopiloted.
    const treatAsAutopiloted = this.hasMultipleDynamicScans
      ? this.eachIncompleteDynamicScanIsAutopiloted ||
        (this.eachIncompleteDynamicScanHasMixedEngines && selectedIsAutopiloted)
      : selectedIsAutopiloted;

    // Autopiloted contexts only hide the button while STOPPING (so the user can
    // stop a running scan). Non-autopiloted contexts hide it whenever the scan
    // is active (RUNNING or STOPPING).
    return treatAsAutopiloted ? !isStopping : !isActive;
  }

  @action
  goToSettings() {
    this.router.transitionTo(
      'authenticated.dashboard.project.settings.dast-automation',
      String(this.args.file?.project?.get('id'))
    );
  }

  @action
  reloadLastAutomatedDynamicScan() {
    this.getLastAutomatedDynamicScan.perform();
  }

  @action
  handleRoleChange(dynamicscan: DynamicscanModel) {
    this.selectedAutomatedDynamicScan = dynamicscan;
  }

  @action
  getDsStatusDisplayPriority(status: number) {
    return this.DS_STATUS_GROUP_DISPLAY_PRIORITY[
      getDsStatusGroupForScan(status)
    ];
  }

  getLastAutomatedDynamicScan = task(async () => {
    try {
      const scans = await this.file.getFileLastAutomatedDynamicScan();

      const sortedScans = [...scans].sort(
        (a, b) =>
          this.getDsStatusDisplayPriority(a.status) -
          this.getDsStatusDisplayPriority(b.status)
      );

      this.lastAutomatedDynamicScans = sortedScans;

      if (scans.length > 0) {
        this.selectedAutomatedDynamicScan = scans[0] ?? null;
      }
    } catch (error) {
      this.logger.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  getDsAutomationPreference = task(async () => {
    try {
      const adapter = this.store.adapterFor('ds-automation-preference');
      adapter.setNestedUrlNamespace(String(this.args.profileId));

      this.automationPreference = await this.store.queryRecord(
        'ds-automation-preference',
        {}
      );
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Automated': typeof FileDetailsDastAutomated;
  }
}
