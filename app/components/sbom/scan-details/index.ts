import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { debounceTask } from 'ember-lifeline';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import { SbomScanStatus } from 'irene/models/sbom-file';
import type SbomFileModel from 'irene/models/sbom-file';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomScanSummaryModel from 'irene/models/sbom-scan-summary';
import type SbomScanDetailsService from 'irene/services/sbom-scan-details';
import type { SbomScanDetailParam } from 'irene/routes/authenticated/dashboard/sbom/scan-details';

import styles from './index.scss';

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
  @tracked activeTab: 'sbom' | 'aibom' = 'sbom';
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
    } = args.queryParams;

    // Always set is_ai_component explicitly; outdated files stay pinned to SBOM since they have no tab bar.
    const resolvedIsAiComponent = this.isNotOutdated
      ? (is_ai_component ?? 'false')
      : 'false';

    this.activeTab = resolvedIsAiComponent === 'true' ? 'aibom' : 'sbom';

    // Force list mode for AI-BOM and outdated files to preserve filters and avoid the tree-mode default.
    const resolvedViewType =
      resolvedIsAiComponent === 'true' || this.args.sbomFile.isOutdated
        ? 'list'
        : view_type;

    this.sbomViewType = this.isNotOutdated ? (view_type ?? 'tree') : 'list';

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
      })
      .setLimitOffset({
        limit: Number(component_limit),
        offset: Number(component_offset),
      })
      .reload();
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
    this.sbomViewType = 'tree';

    const queryParams = {
      view_type: 'tree' as const,
      component_type: -1,
      is_dependency: null,
      is_ai_component: null,
      component_query: '',
    };

    this.router.transitionTo({ queryParams });
    this.sbomScanDetailsService.setQueryData({ ...queryParams }).reload();
  }

  @action
  selectTab(tab: 'sbom' | 'aibom') {
    this.activeTab = tab;
    const is_ai_component = tab === 'aibom' ? 'true' : 'false';

    // AI-BOM always uses list mode; reset tab-specific filters, ordering and the
    // page offset on switch so the URL cannot drift from the service state.
    const queryParams = {
      is_ai_component,
      component_query: '',
      ai_artifact_class: null,
      ai_confidence: null,
      component_type: -1,
      is_dependency: null,
      ordering: null,
      component_offset: 0,
      view_type: tab === 'aibom' ? ('list' as const) : this.sbomViewType,
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
