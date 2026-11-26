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

/**
 * The two component tabs.
 *
 * `insights` is the landing tab when reachability ran: only components the
 * run concluded on, as a flat list. `complete` is the unfiltered SBOM, where
 * the tree lives. `?tab=complete` selects it; no param means insights.
 */
export type SbomScanDetailsView = 'complete' | 'insights';

export interface SbomScanDetailsSignature {
  Args: {
    sbomProject: SbomProjectModel;
    sbomFile: SbomFileModel;
    sbomScanSummary: SbomScanSummaryModel | null;
    queryParams: SbomScanDetailParam;
    /**
     * The live `tab` query param. `queryParams` is the route's snapshot and
     * does not change on Back/Forward (the param does not refresh the
     * model), so the active tab follows this instead.
     */
    tab?: string | null;
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
  @tracked activeTab: 'sbom' | 'aibom' = 'sbom';
  @tracked activeView: SbomScanDetailsView = 'insights';

  /** Tree/list choice on the complete tab, restored when switching back. */
  @tracked sbomViewType: 'tree' | 'list' = 'tree';

  constructor(owner: unknown, args: SbomScanDetailsSignature['Args']) {
    super(owner, args);

    const {
      view_type,
      component_query,
      is_dependency,
      component_type,
      component_limit,
      component_offset,
      is_ai_component,
      ai_artifact_class,
      ai_confidence,
      ordering,
      reachability,
      tab,
    } = args.queryParams;

    // Always set is_ai_component explicitly; outdated files stay pinned to SBOM since they have no tab bar.
    const resolvedIsAiComponent = this.isNotOutdated
      ? (is_ai_component ?? 'false')
      : 'false';

    this.activeTab = resolvedIsAiComponent === 'true' ? 'aibom' : 'sbom';
    this.activeView = this.viewForTab(tab);

    // A stale `?tab=complete` without reachability would otherwise linger in
    // the URL while the complete tab is shown.
    if (tab === 'complete' && !this.hasReachability) {
      runTask(this, () =>
        this.router.replaceWith(this.router.currentRouteName ?? '', {
          queryParams: { tab: null },
        })
      );
    }

    this.sbomViewType = this.isNotOutdated ? (view_type ?? 'tree') : 'list';

    // Force list mode for the insights view, AI-BOM and outdated files to preserve filters and avoid the tree-mode default.
    const resolvedViewType =
      this.isInsightsView ||
      resolvedIsAiComponent === 'true' ||
      this.args.sbomFile.isOutdated
        ? 'list'
        : this.sbomViewType;

    // Set before the first fetch so the filter is part of the initial query,
    // not a second round trip.
    this.sbomScanDetailsService.onlyReachable = this.isInsightsView;

    // Fetch with default queries from the route
    this.sbomScanDetailsService
      .setQueryData({
        sbomFile: this.args.sbomFile,
        view_type: resolvedViewType,
        component_query: component_query,
        dependency_type: is_dependency,
        component_type: Number(component_type),
        is_ai_component: resolvedIsAiComponent,
        ai_artifact_class,
        ai_confidence,
        ordering,
        reachability,
      })
      .setLimitOffset({
        limit: Number(component_limit),
        offset: Number(component_offset),
      })
      .reload();
  }

  /** Polling starts on insert so the constructor stays synchronous. */
  @action
  startReachabilityPolling() {
    void this.pollReachabilityStatus();
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
      void this.sbomScanDetailsService.reload();

      // A bare URL means Insights now, so keep Complete explicit.
      if (this.activeView === 'complete' && !this.args.tab) {
        this.router.replaceWith(this.router.currentRouteName ?? '', {
          queryParams: { tab: 'complete' },
        });
      }

      return;
    }

    if (
      newStatus === ReachabilityScanStatus.FAILED ||
      newStatus === ReachabilityScanStatus.SKIPPED ||
      newStatus === ReachabilityScanStatus.TIMED_OUT
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
        stage.status === ReachabilityScanStatus.SKIPPED ||
        stage.status === ReachabilityScanStatus.TIMED_OUT
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
      case ReachabilityScanStatus.TIMED_OUT:
        return this.intl.t('chipStatus.timedOut');
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
      case ReachabilityScanStatus.TIMED_OUT:
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

  get isInsightsView() {
    return this.activeView === 'insights';
  }

  /**
   * The view a `tab` query param value selects. Without reachability there
   * are no findings to filter on, so the insights tab would be empty; it
   * is the default only when the run produced data. `complete` is explicit.
   */
  viewForTab(tab?: string | null): SbomScanDetailsView {
    return this.reachabilityCompleted && tab !== 'complete'
      ? 'insights'
      : 'complete';
  }

  /**
   * Whether reachability ran for this file at all.
   *
   * Customers who have not enabled it have no scan record, and a skipped run
   * produces no findings either. Both fall back to the component list as it
   * was before reachability existed: no insights split, no reachability
   * column, tree view by default.
   */
  get hasReachability() {
    const status = this.args.sbomFile.reachabilityStatus;

    return (
      status !== null &&
      status !== undefined &&
      status !== ReachabilityScanStatus.SKIPPED
    );
  }

  /** Insights is the default only once the run finished with findings. */
  get reachabilityCompleted() {
    return (
      this.args.sbomFile.reachabilityStatus === ReachabilityScanStatus.COMPLETED
    );
  }

  /** The tabs exist only when there is an insights list to switch to. */
  get showTabs() {
    return this.hasReachability;
  }

  /**
   * The search box sits on the left of the toolbar: on insights unless it is empty, and
   * on the complete tab only in list view (the tree has no search).
   */
  get showSearch() {
    return (
      (!this.isInsightsView || !this.isInsightsEmpty) && this.showSearchBase
    );
  }

  private get showSearchBase() {
    return this.isInsightsView || !this.isTreeView;
  }

  /**
   * Insights finished loading with no findings and nothing narrowing it
   * (no search/filter), i.e. the "No reachability findings" empty state.
   * Read from the service data the list already loaded.
   */
  get isInsightsEmpty() {
    const svc = this.sbomScanDetailsService;

    return (
      this.isInsightsView &&
      !svc.isFetchingSbomComponentList &&
      svc.sbomComponentsCount === 0 &&
      (svc.searchQuery ?? '').trim() === '' &&
      svc.selectedDependencyType === null &&
      svc.selectedComponentType <= -1 &&
      svc.selectedReachability === null
    );
  }

  /** The toolbar strip only renders when it has something in it. */
  get showToolbar() {
    return this.isNotOutdated && (this.showSearch || this.showViewToggle);
  }

  /** The tree survives wherever the insights columns are not shown. */
  get showViewToggle() {
    return !this.isInsightsView;
  }

  get totalComponentCount() {
    return this.args.sbomScanSummary?.componentCount ?? 0;
  }

  /**
   * The tree only exists on the complete tab; the insights list is flat so
   * the per-component reachability counts line up in columns.
   */
  get isTreeView() {
    return (
      this.showViewToggle && this.sbomScanDetailsService.viewType !== 'list'
    );
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

  /**
   * Switch between Complete analysis and Reachability insights. Filters,
   * search and paging are reset so the URL cannot drift from the service
   * state; the complete tab gets back the tree/list mode it was left in.
   */
  @action
  selectViewTab(id: string | number) {
    const tab: SbomScanDetailsView =
      id === 'insights' ? 'insights' : 'complete';

    if (tab === this.activeView) {
      return;
    }

    this.applyView(tab);

    this.router.transitionTo({
      queryParams: {
        tab: tab === 'complete' ? 'complete' : null,
        view_type: this.viewTypeFor(tab),
        component_query: '',
        component_type: -1,
        is_dependency: null,
        reachability: null,
        component_offset: 0,
      },
    });
  }

  @action
  viewCompleteAnalysis() {
    this.selectViewTab('complete');
  }

  /**
   * Follow the `tab` query param when it changes without a tab click
   * (browser Back/Forward, a link). The URL already holds the tab, so only
   * the view and the list are brought in line with it.
   */
  @action
  syncTabFromUrl() {
    const tab = this.viewForTab(this.args.tab);

    if (tab !== this.activeView) {
      this.applyView(tab);
    }
  }

  private viewTypeFor(tab: SbomScanDetailsView) {
    return tab === 'insights' ? 'list' : this.sbomViewType;
  }

  /** Show `tab` and reload its list with filters, search and paging reset. */
  private applyView(tab: SbomScanDetailsView) {
    this.activeView = tab;

    // On the AI-BOM tab only the remembered view changes; the SBOM list
    // (and its reachability filter) is rebuilt when that tab is reselected.
    if (this.activeTab !== 'sbom') {
      return;
    }

    this.sbomScanDetailsService.onlyReachable = tab === 'insights';

    void this.sbomScanDetailsService
      .setQueryData({
        view_type: this.viewTypeFor(tab),
        component_query: '',
        component_type: -1,
        dependency_type: null,
        reachability: null,
      })
      .setLimitOffset({ offset: 0 })
      .reload();
  }

  @action
  handleTreeViewClick() {
    this.sbomViewType = 'tree';

    const queryParams = {
      view_type: 'tree' as const,
      component_type: -1,
      is_dependency: null,
      // The SBOM tab never lists AI components; null would let them into the
      // list view the user toggles to next.
      is_ai_component: 'false',
      component_query: '',
    };

    this.router.transitionTo({ queryParams });
    this.sbomScanDetailsService.setQueryData({ ...queryParams }).reload();
  }

  /**
   * Switch between the SBOM and AI-BOM tabs. Every list-shaping piece of
   * state is re-derived here rather than inherited from the tab being left:
   * the reachability-only filter belongs to the SBOM Insights view alone, and
   * the SBOM tab returns to the view (Insights or Complete) it was left in.
   */
  @action
  selectTab(tab: 'sbom' | 'aibom') {
    this.activeTab = tab;
    const is_ai_component = tab === 'aibom' ? 'true' : 'false';
    const view_type =
      tab === 'aibom' ? 'list' : this.viewTypeFor(this.activeView);

    // Only the SBOM Insights view is limited to reachability findings.
    this.sbomScanDetailsService.onlyReachable =
      tab === 'sbom' && this.isInsightsView;

    // AI-BOM always uses list mode; reset tab-specific filters, ordering and the
    // page offset on switch so the URL cannot drift from the service state.
    const queryParams = {
      is_ai_component,
      component_query: '',
      ai_artifact_class: null,
      ai_confidence: null,
      component_type: -1,
      is_dependency: null,
      reachability: null,
      ordering: null,
      component_offset: 0,
      view_type: view_type as 'list' | 'tree',
    };

    this.router.transitionTo({ queryParams });
    this.sbomScanDetailsService
      .setQueryData({
        is_ai_component: queryParams.is_ai_component,
        component_query: queryParams.component_query,
        ai_artifact_class: queryParams.ai_artifact_class,
        ai_confidence: queryParams.ai_confidence,
        component_type: queryParams.component_type,
        dependency_type: queryParams.is_dependency,
        reachability: queryParams.reachability,
        ordering: queryParams.ordering,
        view_type: queryParams.view_type,
      })
      .setLimitOffset({ offset: 0 })
      .reload();
  }

  @action
  handleListViewClick() {
    this.sbomViewType = 'list';
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
