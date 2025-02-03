import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';
import type IntlService from 'ember-intl/services/intl';

import type SbomProjectModel from 'irene/models/sbom-project';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomFileModel from 'irene/models/sbom-file';
import type { AkTreeNodeFlattenedProps } from 'irene/components/ak-tree/provider';
import type { AkTreeNodeProps } from '..';

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
  @tracked isLoadingMore = false;
  @tracked loadingChildrenKeys: string[] = [];

  constructor(
    owner: unknown,
    args: SbomScanDetailsComponentTreeSignature['Args']
  ) {
    super(owner, args);

    this.loadTreeData();
  }

  get hasNoSbomComponent() {
    return this.args.treeNodes.length === 0;
  }

  get isFilteredTree() {
    return this.args.parentId || this.args.componentId ? true : false;
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

  get isLoading() {
    if (
      (this.fetchSbomComponents.isRunning &&
        this.args.treeNodes.length === 0) ||
      this.loadComponentView.isRunning
    ) {
      return true;
    }
    return false;
  }

  get isOutdated() {
    return this.args.sbomFile.isOutdated;
  }

  @action
  loadTreeData() {
    if (this.args.parentId) {
      // Load children of specified parent and expand the target component
      this.loadComponentView.perform(this.args.parentId);
    } else if (this.args.componentId) {
      // Load single component and its children
      this.loadComponentView.perform(this.args.componentId);
    } else {
      // Normal tree view
      this.fetchSbomComponents.perform(25, 0, '');
    }
  }

  @action
  addMargin(depth: number, hasNextSibling: boolean) {
    if (depth === 1 && !hasNextSibling && !this.hasMoreComponents) {
      return true;
    }

    return false;
  }

  @action
  calculateMargin(depth: number) {
    const base = -10;

    return `${base + depth * 20}px`;
  }

  @action
  calculateLoaderMargin(depth: number) {
    const base = 55;

    return `${base + depth * 20}px`;
  }

  @action
  needsChildrenLoad(key: string) {
    const node = this.findNodeInTree(this.args.treeNodes, key);
    const hasChildren = node?.dataObject?.hasChildren;

    if (node?.children?.length && node?.children?.length > 0) {
      return false;
    }

    return hasChildren || false;
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
  shouldShowViewMoreForChild(node: AkTreeNodeFlattenedProps) {
    // Return false if not a dependency or no parent
    // @ts-expect-error to be fixed
    if (!node.dataObject?.isDependency || !node.parent) {
      return false;
    }

    // Get all currently loaded children for this parent
    const parentNode = this.findNodeInTree(
      this.args.treeNodes,
      node.parent.key
    );

    if (!parentNode?.children) {
      return false;
    }

    // Check if this is the last loaded child
    const isLastLoadedChild =
      parentNode.children[parentNode.children.length - 1]?.key === node.key;

    return isLastLoadedChild && this.hasMoreChildren(node.parent.key);
  }

  @action
  handleLoadMoreChildren(nodeKey: string) {
    const node = this.args.treeNodes.find((n) => n.key === nodeKey);
    if (!node) {
      return;
    }

    const currentChildrenCount = node.children?.length ?? 0;

    this.loadChildrenAndTransform
      .perform(15, currentChildrenCount, nodeKey)
      .then((newChildren) => {
        // Create a map of existing children keys for deduplication
        const existingChildrenKeys = new Set(
          node.children?.map((child) => child.key) ?? []
        );

        // Filter out any duplicate children
        const uniqueNewChildren = newChildren.filter(
          (child) => !existingChildrenKeys.has(child.key)
        );

        this.args.updateTreeNodes(
          this.args.treeNodes.map((n) =>
            n.key === nodeKey
              ? {
                  ...n,
                  children: [...(n.children ?? []), ...uniqueNewChildren],
                }
              : n
          )
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
  isNodeScrollable(nodeKey: string, dependencyCount: number) {
    if (dependencyCount < 7) {
      return false;
    } else {
      const nodeContainer = document.getElementById(
        this.calculateNodeContainerId(nodeKey)
      );

      const mainContainer = document.getElementById('component-tree-container');

      if (nodeContainer && mainContainer) {
        // Get bounding rectangles for positioning
        const nodeRect = nodeContainer.getBoundingClientRect();
        const mainContainerRect = mainContainer.getBoundingClientRect();

        // Check if the node is outside the main container's visible area
        const isOutOfView =
          nodeRect.top < mainContainerRect.top - 50 || // Node is above visible area
          nodeRect.bottom > mainContainerRect.bottom + 50; // Node is below visible area

        return isOutOfView;
      }
    }

    return false;
  }

  @action
  calculateNodeContainerId(nodeKey: string) {
    return `component-tree-node-${nodeKey}`;
  }

  @action
  scrollToParent(parentKey: string) {
    const parentContainer = document.getElementById(
      this.calculateNodeContainerId(parentKey)
    );

    const mainContainer = document.getElementById('component-tree-container');

    if (mainContainer && parentContainer) {
      // Get the parent's position relative to the main container
      const parentRect = parentContainer.getBoundingClientRect();
      const mainContainerRect = mainContainer.getBoundingClientRect();

      // Calculate scroll position to show the parent
      const scrollPosition =
        mainContainer.scrollTop + parentRect.top - mainContainerRect.top;

      // Scroll to position
      mainContainer.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
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
        // Merge existing children with new children instead of complete replacement
        const mergedChildren = updatedNode.children
          ? [...(node.children || []), ...updatedNode.children]
          : node.children;

        return {
          ...node,
          ...updatedNode,
          children: mergedChildren,
        };
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

  @action
  isLoadingChildren(nodeKey: string) {
    return this.loadingChildrenKeys.includes(nodeKey);
  }

  @action
  transformApiDataToTreeFormat(
    components: SbomComponentModel[],
    parentId?: string
  ) {
    return components.map((item: SbomComponentModel, index) => ({
      // For children, create composite key. For parents, use just the ID
      key: parentId ? `${parentId}:${item.id}` : item.id.toString(),
      label: item.name,
      dataObject: {
        name: item.name,
        bomRef: item.bomRef.substring(0, item.bomRef.lastIndexOf(':')),
        version: item.version,
        latestVersion: item.latestVersion,
        vulnerabilitiesCount: item.vulnerabilitiesCount,
        hasChildren: item.dependencyCount > 0,
        dependencyCount: item.dependencyCount,
        hasNextSibling: index < components.length - 1,
        isDependency: parentId ? true : false,
        originalComponent: item,
        isHighlighted: false,
      },
      children: [] as AkTreeNodeProps[],
    }));
  }

  handleNodeExpand = task(async (newExpandedKeys: string[]) => {
    // Find the newly added key by comparing new and old arrays
    const addedKey = newExpandedKeys.find(
      (key) => !this.args.expandedNodes.includes(key)
    );

    const isExpanding = addedKey !== undefined;

    if (isExpanding && addedKey) {
      // Find the node being expanded at any level in the tree
      const expandingNode = this.findNodeInTree(this.args.treeNodes, addedKey);

      // Only proceed if the node exists and has children according to dataObject
      if (expandingNode && expandingNode.dataObject.hasChildren) {
        // Only load children if we need to
        if (this.needsChildrenLoad(addedKey)) {
          // Extract the actual component ID from the composite key
          const componentId = this.getComponentId(addedKey);

          const children = await this.loadChildrenAndTransform.perform(
            15,
            0,
            componentId.toString()
          );

          // Update the node with its children at any level in the tree
          const updatedNodes = this.updateNodeInTree(
            this.args.treeNodes,
            addedKey,
            { children }
          );

          this.args.updateTreeNodes(updatedNodes);
        }

        this.args.updateExpandedNodes(newExpandedKeys);
        return newExpandedKeys;
      }
    }

    // If we get here, either we're collapsing or the node doesn't have children
    if (!isExpanding) {
      this.args.updateExpandedNodes(newExpandedKeys);
      return newExpandedKeys;
    }

    // Return the previous state if expansion was prevented
    return this.args.expandedNodes;
  });

  @action
  depthArray(node: AkTreeNodeFlattenedProps) {
    return Array.from({ length: node.treeDepth });
  }

  handleComponentClick = task(
    async (node: AkTreeNodeProps, parentKey?: string) => {
      // Get component ID directly from the original component
      const componentId = node.dataObject.originalComponent.id;

      // Get parent ID from the last segment of parentKey if it exists
      const parentComponentId = parentKey
        ? Number(parentKey.split(':').pop())
        : 0;

      this.router.transitionTo(
        'authenticated.dashboard.sbom.component-details.overview',
        this.args.sbomProject.id,
        this.args.sbomFile.id,
        componentId,
        parentComponentId
      );
    }
  );

  loadComponentView = task(async (componentId: string) => {
    // Load the single component first
    const queryParams = {
      sbomFileId: this.args.sbomFile.id,
      sbomComponentId: componentId,
    };

    const response = await waitForPromise(
      this.store.queryRecord('sbom-component', queryParams)
    );

    const responseArray = [response];
    const nodes = this.transformApiDataToTreeFormat(responseArray);

    // Load children
    const children = await this.loadChildrenAndTransform.perform(
      15,
      0,
      componentId
    );
    nodes[0]!.children = children;

    // If args.componentId exists and doesn't match the parent's id,
    // it must be one of the children we need to highlight
    if (this.args.componentId && this.args.componentId !== componentId) {
      // Find and highlight the child component
      const childToHighlight = children.find(
        (child: AkTreeNodeProps) =>
          child.dataObject.originalComponent.id === this.args.componentId
      );
      if (childToHighlight) {
        childToHighlight.dataObject.isHighlighted = true;
      }
    } else {
      // Highlight the parent node if it matches componentId
      nodes[0]!.dataObject.isHighlighted = true;
    }

    this.handleNodeExpand.perform([componentId]);
    this.args.updateExpandedNodes([componentId]);
    this.args.updateTreeNodes(nodes);
  });

  loadChildrenAndTransform = task(
    async (limit: number, offset: number, parentId: string) => {
      // Add to loading array
      this.loadingChildrenKeys = [...this.loadingChildrenKeys, parentId];

      const queryParams = {
        type: 1,
        sbomFileId: this.args.sbomFile.id,
        componentId: parentId,
        limit,
        offset,
      };

      try {
        const response = (await waitForPromise(
          this.store.query('sbom-component', queryParams)
        )) as SbomComponentQueryResponse;

        // Pass parentId to create composite keys for children
        const transformedChildren = this.transformApiDataToTreeFormat(
          response.slice(),
          parentId
        );

        // Return transformed children without updating the tree directly
        this.loadingChildrenKeys = this.loadingChildrenKeys.filter(
          (key) => key !== parentId
        );

        return transformedChildren;
      } catch (error) {
        this.loadingChildrenKeys = this.loadingChildrenKeys.filter(
          (key) => key !== parentId
        );

        return [];
      }
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

      if (offset > 0) {
        this.isLoadingMore = true;
      }

      const sbomComponentResponse = (await waitForPromise(
        this.store.query('sbom-component', queryParams)
      )) as SbomComponentQueryResponse;

      const newTreeNodes = this.transformApiDataToTreeFormat(
        sbomComponentResponse.slice()
      );

      // If offset is 0, replace the entire array; otherwise append
      if (offset === 0) {
        this.args.updateTreeNodes(newTreeNodes);
      } else {
        this.args.updateTreeNodes([...this.args.treeNodes, ...newTreeNodes]);
      }

      this.isLoadingMore = false;

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
