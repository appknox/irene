import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import type SbomFileModel from 'irene/models/sbom-file';
import type { SbomComponentQueryParam } from 'irene/routes/authenticated/dashboard/sbom/scan-details';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomScanSummaryModel from 'irene/models/sbom-scan-summary';
import { SbomScanStatus } from 'irene/models/sbom-file';
import styles from './index.scss';

interface TreeNodeDataObject {
  name: string;
  bomRef: string;
  version: string;
  latestVersion: string;
  vulnerabilitiesCount: number;
  hasChildren: boolean;
  hasNextSibling: boolean;
  dependencyCount: number;
  isDependency: boolean;
  isHighlighted: boolean;
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
    queryParams: SbomComponentQueryParam;
  };
}

export default class SbomScanDetailsComponent extends Component<SbomScanDetailsSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @tracked openViewReportDrawer = false;
  @tracked expandedNodes: string[] = [];
  @tracked treeNodes: AkTreeNodeProps[] = [];
  @tracked currentViewType: 'tree' | 'list' =
    this.args.queryParams.view_type || 'tree';

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
    return this.currentViewType !== 'list';
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
    this.currentViewType = 'tree';
    this.router.transitionTo({ queryParams: { view_type: 'tree' } });
  }

  @action
  handleListViewClick() {
    this.currentViewType = 'list';
    this.router.transitionTo({ queryParams: { view_type: 'list' } });
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails': typeof SbomScanDetailsComponent;
  }
}
