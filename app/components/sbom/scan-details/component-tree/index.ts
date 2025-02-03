import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

import IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import SbomProjectModel from 'irene/models/sbom-project';
import SbomComponentModel from 'irene/models/sbom-component';
import SbomFileModel from 'irene/models/sbom-file';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';
import RouterService from '@ember/routing/router-service';
import { waitForPromise } from '@ember/test-waiters';
import { AkTreeNodeProps } from '..';
import { AkTreeNodeFlattenedProps } from 'irene/components/ak-tree/provider';

export interface SbomScanDetailsComponentTreeSignature {
  Args: {
    sbomProject: SbomProjectModel;
    sbomFile: SbomFileModel;
    packageName: string;
    expandedNodes: string[];
    treeNodes: AkTreeNodeProps[];
    updateExpandedNodes: (nodes: string[]) => void;
    updateTreeNodes: (nodes: AkTreeNodeProps[]) => void;
    componentId?: string;
    parentId?: string;
  };
}

export type SbomComponentQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomComponentModel> & {
    meta: { count: number };
  };

export default class SbomScanDetailsComponentTreeComponent extends Component<SbomScanDetailsComponentTreeSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;

  @tracked componentQueryResponse: SbomComponentQueryResponse | null = null;
  @tracked hasMoreComponents = false;

  constructor(
    owner: unknown,
    args: SbomScanDetailsComponentTreeSignature['Args']
  ) {
    super(owner, args);

    if (args.parentId) {
      // Load children of specified parent and expand the target component
      this.loadComponentView.perform(args.parentId);
    } else if (args.componentId) {
      // Load single component and its children
      this.loadComponentView.perform(args.componentId);
    } else {
      // Normal tree view
      this.fetchSbomComponents.perform(25, 0, '');
    }
  }

  get hasNoSbomComponent() {
    return this.args.treeNodes.length === 0;
  }

  get isScrollable() {
    const container = document.getElementById('component-tree-container');

    if (container) {
      // Use a small buffer to account for potential minor height differences
      const scrollThreshold = 10;
      return container.scrollHeight > container.clientHeight + scrollThreshold;
    }

    return false;
  }

  get isOutdated() {
    return this.args.sbomFile.isOutdated;
  }

  @action
  calculateMargin(depth: number, hasNextSibling: boolean) {
    if (depth === 1 && !hasNextSibling && !this.hasMoreComponents) {
      return true;
    }

    return false;
  }

  @action
  needsChildrenLoad(key: string) {
    const node = this.findNodeInTree(this.args.treeNodes, key);
    const hasChildren = node?.dataObject?.hasChildren;

    return hasChildren || false;
  }

  @action
  handleComponentClick(node: AkTreeNodeProps, parentKey?: string) {
    console.log(node, parentKey);

    // Get component ID directly from the original component
    const componentId = node.dataObject.originalComponent.id;

    // Get parent ID from the last segment of parentKey if it exists
    const parentComponentId = parentKey
      ? Number(parentKey.split(':').pop())
      : 0;

    this.router.transitionTo(
      'authenticated.dashboard.sbom.component-details',
      this.args.sbomProject.id,
      this.args.sbomFile.id,
      componentId,
      parentComponentId
    );
  }

  @action
  scrollToTop() {
    const container = document.getElementById('component-tree-container');

    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  @action
  handleLoadMoreAction() {
    this.fetchSbomComponents.perform(25, this.args.treeNodes.length, '');
  }

  @action
  isNodeExpanded(nodeKey: string) {
    return this.args.expandedNodes.includes(nodeKey);
  }

  @action
  handleLoadMoreChildren(nodeKey: string) {
    const node = this.args.treeNodes.find((n) => n.key === nodeKey);
    if (!node) {
      return;
    }

    const currentChildren = node.children || [];

    this.loadChildrenAndTransform
      .perform(15, currentChildren.length, nodeKey)
      .then((newChildren) => {
        this.args.updateTreeNodes(
          this.args.treeNodes.map((n) => {
            if (n.key === nodeKey) {
              return {
                ...n,
                children: [...currentChildren, ...newChildren],
              };
            }
            return n;
          })
        );
      });
  }

  @action
  hasMoreChildren(nodeKey: string) {
    const node = this.args.treeNodes.find((node) => node.key === nodeKey);

    if (!node?.children) {
      return;
    } else if (node?.children?.length < node?.dataObject?.dependencyCount) {
      return true;
    }

    return false;
  }

  @action
  isNodeScrollable(nodeKey: string) {
    const container = document.getElementById(
      this.calculateNodeContainerId(nodeKey)
    );

    if (container) {
      // Use a small buffer to account for potential minor height differences
      const scrollThreshold = 10;
      return container.scrollHeight > container.clientHeight + scrollThreshold;
    }

    return false;
  }

  @action
  calculateNodeContainerId(nodeKey: string) {
    return `component-tree-node-${nodeKey}`;
  }

  @action
  scrollToParent(nodeKey: string) {
    const container = document.getElementById(
      this.calculateNodeContainerId(nodeKey)
    );

    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  @action
  updateNodeInTree(
    nodes: AkTreeNodeProps[],
    targetKey: string,
    updatedNode: Partial<AkTreeNodeProps>
  ): AkTreeNodeProps[] {
    return nodes.map((node) => {
      if (node.key === targetKey) {
        return { ...node, ...updatedNode };
      }

      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: this.updateNodeInTree(
            node.children,
            targetKey,
            updatedNode
          ),
        };
      }

      return node;
    });
  }

  @action
  findNodeInTree(
    nodes: AkTreeNodeProps[],
    targetKey: string
  ): AkTreeNodeProps | null {
    for (const node of nodes) {
      if (node.key === targetKey) {
        return node;
      }

      if (node.children && node.children.length > 0) {
        const found = this.findNodeInTree(node.children, targetKey);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  @action
  getComponentId(key: string): number {
    // Extract the last part of the composite key (after the last colon)
    // or use the entire key if no colon exists
    const parts = key.split(':');
    return Number(parts[parts.length - 1]);
  }

  handleNodeExpand = task(async (expandedKeys: string[]) => {
    const lastKey = expandedKeys[expandedKeys.length - 1];
    const isExpanding = lastKey && !this.args.expandedNodes.includes(lastKey);

    if (isExpanding) {
      // Find the node being expanded at any level in the tree
      const expandingNode = this.findNodeInTree(this.args.treeNodes, lastKey);

      // Only proceed if the node exists and has children according to dataObject
      if (expandingNode && expandingNode.dataObject.hasChildren) {
        // Only load children if we need to
        if (this.needsChildrenLoad(lastKey)) {
          // Extract the actual component ID from the composite key
          const componentId = this.getComponentId(lastKey);

          const children = await this.loadChildrenAndTransform.perform(
            15,
            0,
            componentId.toString() // Use the actual component ID
          );

          // Update the node with its children at any level in the tree
          const updatedNodes = this.updateNodeInTree(
            this.args.treeNodes,
            lastKey, // Keep using the full key for tree updates
            { children }
          );
          this.args.updateTreeNodes(updatedNodes);
        }

        this.args.updateExpandedNodes(expandedKeys);
        return expandedKeys;
      }
    }

    // If we get here, either we're collapsing or the node doesn't have children
    if (!isExpanding) {
      this.args.updateExpandedNodes(expandedKeys);
      return expandedKeys;
    }

    // Return the previous state if expansion was prevented
    return this.args.expandedNodes;
  });

  @action
  depthArray(node: AkTreeNodeFlattenedProps) {
    return Array.from({ length: node.treeDepth });
  }

  transformApiDataToTreeFormat = task(
    async (components: SbomComponentModel[], parentId?: string) => {
      return components.map((item: SbomComponentModel, index) => ({
        // For children, create composite key. For parents, use just the ID
        key: parentId ? `${parentId}:${item.id}` : item.id.toString(),
        label: item.name,
        dataObject: {
          name: item.name,
          bomRef: item.bomRef,
          version: item.version,
          latestVersion: item.latestVersion,
          vulnerabilitiesCount: item.vulnerabilitiesCount,
          hasChildren: item.dependencyCount > 0,
          dependencyCount: item.dependencyCount,
          nextSibling: index < components.length - 1,
          isDependency: parentId ? true : false,
          originalComponent: item,
          isHighlighted: false,
        },
        children: [],
      }));
    }
  );

  loadComponentView = task(async (componentId: string) => {
    // Load the single component first
    const queryParams = {
      sbomComponentId: componentId,
    };

    const response = await waitForPromise(
      this.store.queryRecord('sbom-component', queryParams)
    );

    const responseArray = [response];
    const nodes =
      await this.transformApiDataToTreeFormat.perform(responseArray);

    // Load children
    const children = await this.loadChildrenAndTransform.perform(
      15,
      0,
      componentId
    );
    nodes[0].children = children;

    // If args.componentId exists and doesn't match the parent's id,
    // it must be one of the children we need to highlight
    if (this.args.componentId && this.args.componentId !== componentId) {
      // Find and highlight the child component
      const childToHighlight = children.find(
        (child) =>
          child.dataObject.originalComponent.id === this.args.componentId
      );
      if (childToHighlight) {
        childToHighlight.dataObject.isHighlighted = true;
      }
    } else {
      // Highlight the parent node if it matches componentId
      nodes[0].dataObject.isHighlighted = true;
    }

    this.handleNodeExpand.perform([componentId]);
    this.args.updateExpandedNodes([componentId]);
    this.args.updateTreeNodes(nodes);
  });

  loadChildrenAndTransform = task(
    async (limit: number, offset: number, parentId: string) => {
      console.log('load children called', parentId);
      const queryParams = {
        type: 1,
        sbomFileId: this.args.sbomFile.id,
        componentId: parentId,
        limit,
        offset,
      };

      const response = await waitForPromise(
        this.store.query('sbom-component', queryParams)
      );

      // Pass parentId to create composite keys for children
      return this.transformApiDataToTreeFormat.perform(
        response.slice(),
        parentId
      );
    }
  );

  fetchSbomComponents = task(
    { drop: true },
    async (limit: number, offset: number, query: string) => {
      const queryParams = {
        type: 1,
        sbomFileId: this.args.sbomFile.id,
        limit,
        offset,
        q: query,
      };

      const sbomComponentResponse = (await waitForPromise(
        this.store.query('sbom-component', queryParams)
      )) as SbomComponentQueryResponse;

      const newTreeNodes = await this.transformApiDataToTreeFormat.perform(
        sbomComponentResponse.slice()
      );

      // If offset is 0, replace the entire array; otherwise append
      if (offset === 0) {
        this.args.updateTreeNodes(newTreeNodes);
      } else {
        this.args.updateTreeNodes([...this.args.treeNodes, ...newTreeNodes]);
      }

      // Check if we've loaded all components
      this.hasMoreComponents =
        this.args.treeNodes.length < (sbomComponentResponse.meta?.count || 0);
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentTree': typeof SbomScanDetailsComponentTreeComponent;
  }
}
