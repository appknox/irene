import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { TrackedMap } from 'tracked-built-ins';
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
import type EventBusService from 'irene/services/event-bus';

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
  @service declare eventBus: EventBusService;

  @tracked automationPreference: DsAutomationPreferenceModel | null = null;
  @tracked lastAutomatedDynamicScans: DynamicscanModel[] = [];
  @tracked selectedAutomatedDynamicScan: DynamicscanModel | null = null;

  navigationGraphAvailability = new TrackedMap<string, boolean>();

  DS_STATUS_GROUP_DISPLAY_PRIORITY = {
    [DsStatusGroup.RUNNING]: 0,
    [DsStatusGroup.STARTING]: 1,
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

    this.eventBus.on(
      'ws:dynamicscan:update',
      this,
      this.handleDynamicScanUpdate
    );
  }

  get file() {
    return this.args.file;
  }

  get profileId() {
    return this.file.profile.get('id') as string;
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
    const scanId = this.selectedAutomatedDynamicScan?.id;

    return scanId
      ? this.navigationGraphAvailability.get(scanId) === true
      : false;
  }

  get cumulativeScanStatus() {
    return getCumulativeDsStatusGroup(
      this.lastAutomatedDynamicScans.map((scan) => scan.status)
    );
  }

  get cumulativeScanStatusText() {
    return this.intl.t(DS_STATUS_GROUP_LABEL[this.cumulativeScanStatus]);
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
    this.checkAndSetNavigationGraphAvailability.perform(dynamicscan);
  }

  @action
  handleDynamicScanUpdate(dsScan: DynamicscanModel) {
    const dynamicScanIsForThisFile =
      String(dsScan.file.get('id')) === String(this.file.id);

    const scanIsInList = this.lastAutomatedDynamicScans.some(
      (scan) => scan.id === dsScan.id
    );

    // Ignore updates for other files or scans not in our list.
    if (!dynamicScanIsForThisFile || !scanIsInList) {
      return;
    }

    if (dsScan.isCompleted) {
      this.checkAndSetNavigationGraphAvailability.perform(dsScan);
    }
  }

  @action
  setSelectedScanAndLoadNavigationGraph(scans: DynamicscanModel[]) {
    // Set the first scan as the default selected scan
    if (scans.length > 0) {
      const selectedScan = scans[0] ?? null;
      this.selectedAutomatedDynamicScan = selectedScan;

      this.checkAndSetNavigationGraphAvailability.perform(selectedScan);
    }
  }

  @action
  getDsStatusDisplayPriority(status: number) {
    return this.DS_STATUS_GROUP_DISPLAY_PRIORITY[
      getDsStatusGroupForScan(status)
    ];
  }

  // `enqueue` runs probes one at a time instead of concurrently, so a burst of
  // WS updates can't fire overlapping requests.
  checkAndSetNavigationGraphAvailability = task(
    { enqueue: true },
    async (scan: DynamicscanModel | null) => {
      // No need to probe for navigation graph if the scan is not provided
      if (!scan) {
        return;
      }

      // Skip if the scan isn't completed or has already been checked (the
      // result is cached either way).
      const scanHasNavGraph = this.navigationGraphAvailability.get(scan.id);

      if (!scan.isCompleted || scanHasNavGraph) {
        return;
      }

      const adapter = this.store.adapterFor('ds-navigation-graph');
      adapter.setNestedUrlNamespace(scan.id);

      try {
        const graph = await this.store.queryRecord('ds-navigation-graph', {});
        this.navigationGraphAvailability.set(scan.id, Boolean(graph));
      } catch {
        this.navigationGraphAvailability.set(scan.id, false);
      }
    }
  );

  getLastAutomatedDynamicScan = task(async () => {
    try {
      const scans = await this.file.getFileLastAutomatedDynamicScan();

      const sortedScans = [...scans].sort(
        (a, b) =>
          this.getDsStatusDisplayPriority(a.status) -
          this.getDsStatusDisplayPriority(b.status)
      );

      this.lastAutomatedDynamicScans = sortedScans;

      this.setSelectedScanAndLoadNavigationGraph(sortedScans);
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

  willDestroy(): void {
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
    'FileDetails::DynamicScan::Automated': typeof FileDetailsDastAutomated;
  }
}
