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
  Blocks: {
    multipleParentsBlock?: [];
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
    if (depth === 1 && !hasNextSibling) {
      return true;
    }

    return false;
  }

  @action
  calculateMargin(base: number, depth: number) {
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
    // Find the current node in the tree
    const currentNode = this.findNodeInTree(this.args.treeNodes, node.key);

    // Return false if node or currentNode not found, or not a dependency, or no parent
    if (!currentNode || !currentNode.dataObject?.isDependency || !node.parent) {
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

    return isLastLoadedChild && this.hasMoreChildren(currentNode, parentNode);
  }

  @action
  handleLoadMoreChildren(node: AkTreeNodeProps) {
    const currentChildrenCount = node.children?.length ?? 0;

    this.loadChildrenAndTransform
      .perform(15, currentChildrenCount, node.key)
      .then((newChildren) => {
        const updatedNodes = this.updateNodeInTree(
          this.args.treeNodes,
          node.key,
          {
            children: newChildren,
          }
        );

        this.args.updateTreeNodes(updatedNodes);
      });
  }

  @action
  hasMoreChildren(
    node: AkTreeNodeProps | null,
    parentNode: AkTreeNodeProps | null
  ) {
    // Early return if either node is null
    if (!node || !parentNode?.children) {
      return false;
    }

    const currentChildrenCount = parentNode.children.length;
    const totalCount = node.dataObject?.count ?? 0;

    // Return true if current children count is less than total expected count
    return currentChildrenCount < totalCount;
  }

  @action
  isNodeScrollable(node: AkTreeNodeFlattenedProps) {
    const parent = node.parent;

    if (!parent.children) {
      return false;
    }

    // Check if this is the last loaded child
    const isLastLoadedChild =
      parent.children[parent.children.length - 1]?.key === node.key;

    if (parent.children.length < 9 || !isLastLoadedChild) {
      return false;
    } else {
      const nodeContainer = document.getElementById(
        this.calculateNodeContainerId(parent.key)
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
    count?: number,
    parentKey?: string
  ) {
    return components.map((item: SbomComponentModel, index) => {
      // Extract parts from bomRef
      const bomRefParts = item.bomRef.split(':').filter(Boolean);
      const ecosystem = bomRefParts[0] || 'generic';
      const group = bomRefParts.length === 3 ? bomRefParts[1] : ''; // Present only in 3-part bomRef

      // Construct PURL
      const groupPrefix = group ? `${group}/` : '';
      const versionSuffix = item.version ? `@${item.version}` : '';
      const purl = `pkg:${ecosystem}/${groupPrefix}${item.name}${versionSuffix}`;

      return {
        // For root components, use just the ID
        // For children, chain the new ID to the parent's full path
        key: parentKey ? `${parentKey}:${item.id}` : item.id.toString(),
        label: purl,
        dataObject: {
          name: item.name,
          bomRef: item.bomRef,
          version: item.version,
          latestVersion: item.latestVersion,
          vulnerabilitiesCount: item.vulnerabilitiesCount,
          hasChildren: item.dependencyCount > 0,
          hasNextSibling: index < components.length - 1,
          isDependency: !!parentKey,
          originalComponent: item,
          isHighlighted: false,
          count: count || 0,
        },
        children: [] as AkTreeNodeProps[],
      };
    });
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
          const children = await this.loadChildrenAndTransform.perform(
            15,
            0,
            addedKey
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

      // For the parent ID, we need the immediate parent, not the last in the entire chain
      let parentComponentId = 0;

      if (parentKey) {
        // If node key has a parent structure (meaning it's not a root component),
        // extract the immediate parent ID
        const nodeKeyParts = node.key.split(':');
        if (nodeKeyParts.length > 1) {
          // The immediate parent ID is the second-to-last segment in the node's key
          parentComponentId = Number(nodeKeyParts[nodeKeyParts.length - 2]);
        }
      }

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

    if (nodes[0]?.key) {
      // Load children using the component's ID as the parent key
      const children = await this.loadChildrenAndTransform.perform(
        15,
        0,
        nodes[0].key
      );

      nodes[0].children = children;

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
        nodes[0].dataObject.isHighlighted = true;
      }
    } else {
      if (nodes[0]) {
        nodes[0].children = [];
      }
    }

    if (nodes[0]?.key) {
      this.handleNodeExpand.perform([nodes[0].key]);
      this.args.updateExpandedNodes([nodes[0].key]);
    }

    this.args.updateTreeNodes(nodes);
  });

  loadChildrenAndTransform = task(
    async (limit: number, offset: number, parentKey: string) => {
      // Add to loading array
      this.loadingChildrenKeys = [...this.loadingChildrenKeys, parentKey];

      // Extract the component ID from the parent key
      const componentId = this.getComponentId(parentKey);

      const queryParams = {
        type: 1,
        sbomFileId: this.args.sbomFile.id,
        componentId: componentId,
        limit,
        offset,
      };

      try {
        const response = (await waitForPromise(
          this.store.query('sbom-component', queryParams)
        )) as SbomComponentQueryResponse;

        // Pass the full parent key to create properly chained composite keys for children
        const transformedChildren = this.transformApiDataToTreeFormat(
          response.slice(),
          response.meta.count,
          parentKey
        );

        // Return transformed children without updating the tree directly
        this.loadingChildrenKeys = this.loadingChildrenKeys.filter(
          (key) => key !== parentKey
        );

        return transformedChildren;
      } catch (error) {
        this.loadingChildrenKeys = this.loadingChildrenKeys.filter(
          (key) => key !== parentKey
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
        sbomComponentResponse.slice(),
        sbomComponentResponse.meta.count
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
