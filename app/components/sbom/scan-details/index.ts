import Component from '@glimmer/component';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { debounceTask, runTask } from 'ember-lifeline';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import { SbomScanStatus } from 'irene/models/sbom-file';
import type SbomFileModel from 'irene/models/sbom-file';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomScanSummaryModel from 'irene/models/sbom-scan-summary';
import type SbomScanDetailsService from 'irene/services/sbom-scan-details';
import type { SbomScanDetailParam } from 'irene/routes/authenticated/dashboard/sbom/scan-details';
import type { AkChipColor } from 'irene/components/ak-chip';
import { ReachabilityScanStatus } from 'irene/utils/sbom-reachability';

import styles from './index.scss';

/** Interval between sbom-file reloads while a reachability run is live. */
const REACHABILITY_POLL_INTERVAL_MS = 7000;

interface TreeNodeDataObject {
  name: string;
  bomRef: string;
  version: string;
  latestVersion: string;
  vulnerabilitiesCount: number;
  hasChildren: boolean;
  hasNextSibling: boolean;
  isDependency: boolean;
  isHighlighted: boolean;
  count: number;
  originalComponent: SbomComponentModel;
}

export type AkTreeNodeProps = {
  key: string;
  label: string;
  dataObject: TreeNodeDataObject;
  children: AkTreeNodeProps[];
};

export interface SbomScanDetailsSignature {
  Args: {
    sbomProject: SbomProjectModel;
    sbomFile: SbomFileModel;
    sbomScanSummary: SbomScanSummaryModel | null;
    queryParams: SbomScanDetailParam;
  };
}

export default class SbomScanDetailsComponent extends Component<SbomScanDetailsSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @service('sbom-scan-details')
  declare sbomScanDetailsService: SbomScanDetailsService;

  @tracked openViewReportDrawer = false;
  @tracked expandedNodes: string[] = [];
  @tracked treeNodes: AkTreeNodeProps[] = [];

  constructor(owner: unknown, args: SbomScanDetailsSignature['Args']) {
    super(owner, args);

    const {
      view_type,
      component_query,
      is_dependency,
      component_type,
      component_limit,
      component_offset,
      reachability,
    } = args.queryParams;

    // Fetch with default queries from the route
    this.sbomScanDetailsService
      .setQueryData({
        sbomFile: this.args.sbomFile,
        view_type,
        component_query: component_query,
        dependency_type: is_dependency,
        component_type: Number(component_type),
        reachability,
      })
      .setLimitOffset({
        limit: Number(component_limit),
        offset: Number(component_offset),
      })
      .reload();

    this.pollReachabilityStatus();
  }

  /**
   * Poll only the sbom-file record while reachability is pending/in-progress
   * (or hasn't started yet but the pipeline is still running). The paginated
   * component list is reloaded once on completion — re-running the finding
   * aggregation on every tick would be wasteful.
   */
  private async pollReachabilityStatus() {
    const file = this.args.sbomFile;
    const status = file.reachabilityStatus;
    const pipelineRunning =
      file.status === SbomScanStatus.PENDING ||
      file.status === SbomScanStatus.IN_PROGRESS;

    const reachabilityRunning =
      status === ReachabilityScanStatus.PENDING ||
      status === ReachabilityScanStatus.IN_PROGRESS;

    const waitingForFirstScan = status === null && pipelineRunning;

    if (!reachabilityRunning && !waitingForFirstScan) {
      return;
    }

    await file.reload();

    const newStatus = file.reachabilityStatus;

    if (newStatus === ReachabilityScanStatus.COMPLETED) {
      // Terminal state — refresh the component list once so verdict chips
      // appear without a page reload, then stop polling.
      this.sbomScanDetailsService.reload();

      return;
    }

    if (
      newStatus === ReachabilityScanStatus.FAILED ||
      newStatus === ReachabilityScanStatus.SKIPPED
    ) {
      return;
    }

    if (!isDestroyed(this) && !isDestroying(this)) {
      runTask(
        this,
        () => this.pollReachabilityStatus(),
        REACHABILITY_POLL_INTERVAL_MS
      );
    }
  }

  get classes() {
    return {
      akLinkBtn: styles['ak-link-btn'],
    };
  }

  get packageName() {
    return this.args.sbomProject.project.get('packageName');
  }

  get scanStatusText() {
    if (this.args.sbomFile.status === SbomScanStatus.FAILED) {
      return {
        title: this.intl.t('sbomModule.sbomScanStatusError.title'),
        description: this.intl.t('sbomModule.sbomScanStatusError.description'),
      };
    }

    return {
      title: this.intl.t('sbomModule.sbomScanStatusProgress.title'),
      description: this.intl.t('sbomModule.sbomScanStatusProgress.description'),
    };
  }

  get scanStatusCompleted() {
    return this.args.sbomFile.status === SbomScanStatus.COMPLETED;
  }

  get scanStatusFailed() {
    return this.args.sbomFile.status === SbomScanStatus.FAILED;
  }

  /**
   * Per-stage scan progress: composition → vulnerability scan → reachability.
   * `status` (vulnerability scan) is the only stage guaranteed to exist;
   * composition/reachability report null until their first scan record lands.
   */
  get scanStages() {
    const file = this.args.sbomFile;

    const stages: { label: string; status: number | null; error?: string }[] = [
      {
        label: this.intl.t('sbomModule.scanStages.composition'),
        status: file.compositionStatus,
      },
      {
        label: this.intl.t('sbomModule.scanStages.vulnerabilityScan'),
        status: file.status,
      },
      {
        label: this.intl.t('sbomModule.scanStages.reachability'),
        status: file.reachabilityStatus,
        error: file.reachabilityError,
      },
    ];

    return stages.map((stage) => ({
      label: stage.label,
      statusText: this.scanStageStatusText(stage.status),
      color: this.scanStageStatusColor(stage.status),
      // Reason tooltip only makes sense for terminal non-success states.
      error:
        stage.status === SbomScanStatus.FAILED ||
        stage.status === ReachabilityScanStatus.SKIPPED
          ? stage.error
          : undefined,
    }));
  }

  private scanStageStatusText(status: number | null): string {
    switch (status) {
      case SbomScanStatus.PENDING:
        return this.intl.t('chipStatus.pending');
      case SbomScanStatus.IN_PROGRESS:
        return this.intl.t('chipStatus.inProgress');
      case SbomScanStatus.COMPLETED:
        return this.intl.t('chipStatus.completed');
      case SbomScanStatus.FAILED:
        return this.intl.t('chipStatus.failed');
      case ReachabilityScanStatus.SKIPPED:
        return this.intl.t('chipStatus.skipped');
      default:
        return this.intl.t('notStarted');
    }
  }

  private scanStageStatusColor(status: number | null): AkChipColor {
    switch (status) {
      case SbomScanStatus.COMPLETED:
        return 'success';
      case SbomScanStatus.PENDING:
      case SbomScanStatus.IN_PROGRESS:
        return 'warn';
      case SbomScanStatus.FAILED:
        return 'error';
      default:
        return 'default';
    }
  }

  get isTreeExpanded() {
    return this.expandedNodes.length > 0;
  }

  get isNotOutdated() {
    return !this.args.sbomFile.isOutdated;
  }

  get isTreeView() {
    return this.sbomScanDetailsService.viewType !== 'list';
  }

  @action
  updateExpandedNodes(nodes: string[]) {
    this.expandedNodes = nodes;
  }

  @action
  updateTreeNodes(nodes: AkTreeNodeProps[]) {
    this.treeNodes = nodes;
  }

  @action
  handleViewReportDrawerOpen() {
    this.openViewReportDrawer = true;
  }

  @action
  handleViewReportDrawerClose() {
    this.openViewReportDrawer = false;
  }

  @action
  handleTreeViewClick() {
    const queryParams = {
      view_type: 'tree' as const,
      component_type: -1,
      is_dependency: null,
      component_query: '',
    };

    this.router.transitionTo({ queryParams });
    this.sbomScanDetailsService.setQueryData({ ...queryParams }).reload();
  }

  @action
  handleListViewClick() {
    const queryParams = { view_type: 'list' as const };

    this.router.transitionTo({ queryParams });
    this.sbomScanDetailsService.setQueryData(queryParams).reload();
  }

  @action
  collapseAll() {
    // Clear expanded nodes
    this.expandedNodes = [];

    // Create new tree nodes array with cleared children
    this.treeNodes = this.treeNodes.map((node) => ({
      ...node,
      children: [],
    }));
  }

  @action
  handleSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    debounceTask(this, 'setSearchQuery', query, 500);
  }

  @action
  setSearchQuery(query: string) {
    this.router.transitionTo({
      queryParams: {
        component_query: query,
        component_offset: 0,
      },
    });

    // Reload Service Table Data
    this.sbomScanDetailsService
      .setQueryData({ component_query: query })
      .setLimitOffset({ offset: 0 })
      .reload();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails': typeof SbomScanDetailsComponent;
  }
}
