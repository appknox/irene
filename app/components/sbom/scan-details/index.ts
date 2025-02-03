import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import SbomFileModel, { SbomScanStatus } from 'irene/models/sbom-file';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import styles from './index.scss';

import { SbomComponentQueryParam } from 'irene/routes/authenticated/dashboard/sbom/scan-details';
import SbomComponentModel from 'irene/models/sbom-component';
import SbomProjectModel from 'irene/models/sbom-project';
import SbomScanSummaryModel from 'irene/models/sbom-scan-summary';
import RouterService from '@ember/routing/router-service';

interface TreeNodeDataObject {
  name: string;
  bomRef: string;
  version: string;
  latestVersion: string;
  vulnerabilitiesCount: number;
  hasChildren: boolean;
  nextSibling: boolean;
  dependencyCount: number;
  isDependency: boolean;
  originalComponent: SbomComponentModel;
}

export type AkTreeNodeProps = {
  key: string;
  label: string;
  dataObject: TreeNodeDataObject;
  children?: AkTreeNodeProps[];
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
  @tracked isTreeView = true;
  @tracked expandedNodes: string[] = [];
  @tracked treeNodes: AkTreeNodeProps[] = [];

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
    this.isTreeView = true;
  }

  @action
  handleListViewClick() {
    this.isTreeView = false;
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
