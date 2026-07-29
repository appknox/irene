/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';
import { addObserver, removeObserver } from '@ember/object/observers';

// Base Tree Node Shape
export interface AkTreeNodeProps {
  key: string;
  label?: string;
  checked?: boolean;
  expanded?: boolean;
  showCheckbox?: boolean;
  disabled?: boolean;
  dataObject?: unknown;
  children?: Array<AkTreeNodeProps>;
}

// Flattened Tree Node Shape
export interface AkTreeNodeFlattenedProps extends AkTreeNodeProps {
  parent: AkTreeNodeProps;
  isChild: boolean;
  isParent: boolean;
  isLeaf: boolean;
  treeDepth: number;
  index: number;
  isRoot: boolean;
  hasParentSibling: boolean;
  indeterminate: boolean;
}

export type AkTreeProviderFlatNodes = Record<string, AkTreeNodeFlattenedProps>;

// Component Signature
export type AkTreeProviderCheckExpandFuncType = (
  keys: Array<string>,
  node: AkTreeNodeFlattenedProps,
  flatNodes: AkTreeProviderFlatNodes
) => void;

export interface AkTreeProviderSignatureArgs<N extends AkTreeNodeProps> {
  treeData: Array<N>;
  expanded: Array<string>;
  checked: Array<string>;
  cascade?: boolean;
  disabled?: boolean;
  onCheck: AkTreeProviderCheckExpandFuncType;
  onExpand: AkTreeProviderCheckExpandFuncType;
}

export interface AkTreeProviderDefaultBlockProps<
  N extends AkTreeNodeProps,
> extends Omit<
  AkTreeProviderSignatureArgs<N>,
  'treeData' | 'onCheck' | 'onExpand'
> {
  nodes: Array<N>;
  flatNodes: AkTreeProviderFlatNodes;
  getFlatNode(key?: string): AkTreeNodeFlattenedProps | undefined;
  onExpand(node: AkTreeNodeProps | undefined): void;
  onCheck(node: AkTreeNodeProps | undefined, ev: MouseEvent): void;
}

export interface AkTreeProviderSignature<N extends AkTreeNodeProps> {
  Element: HTMLUListElement;
  Args: AkTreeProviderSignatureArgs<N>;
  Blocks: {
    default: [AkTreeProviderDefaultBlockProps<N>];
  };
}

/**
 * Provides functionalities for managing and interacting with a tree structure of nodes.
 * Supports expanding, collapsing,
 * and checking nodes, with optional cascading behavior.
 *
 * @template N - The type of the tree node properties.
 * @extends {Component<AkTreeProviderSignature<N>>}
 * @src https://github.com/jakezatecky/react-checkbox-tree
 */
export default class AkTreeProviderComponent<
  N extends AkTreeNodeProps,
> extends Component<AkTreeProviderSignature<N>> {
  @tracked flatNodes: AkTreeProviderFlatNodes = {};

  constructor(owner: unknown, args: AkTreeProviderSignature<N>['Args']) {
    super(owner, args);

    this.initialize();

    addObserver(this.args, 'treeData', this.initialize);
  }

  willDestroy(): void {
    super.willDestroy();

    removeObserver(this.args, 'treeData', this.initialize);
  }

  get expanded() {
    return this.args.expanded;
  }

  get checked() {
    return this.args.checked;
  }

  get disabled() {
    return this.args.disabled;
  }

  get cascade() {
    return this.args.cascade ?? true;
  }

  @action
  initialize() {
    this.flatNodes = {};

    this.flattenNodes(this.args.treeData);
    this.deserializeLists();
  }

  /**
   * Returns a flattened node
   * @param {string | undefined} key - The key of the node.
   * @return {AkTreeNodeFlattenedProps | undefined} The requested node.
   * @memberof AkTreeProviderComponent
   */
  @action getFlatNode(key?: string): AkTreeNodeFlattenedProps | undefined {
    if (key) {
      return this.flatNodes[key];
    }
  }

  /**
   * Handles the check event for a node.
   * @param {AkTreeNodeProps | undefined} node - The node information.
   * @param {Event} ev - The event object.
   * @memberof AkTreeProviderComponent
   */
  @action onCheck(node: AkTreeNodeProps | undefined, ev: MouseEvent) {
    ev.stopPropagation();

    const checked = (ev.target as HTMLInputElement).checked;
    const flatNode = this.getFlatNode(node?.key);

    if (!node || !flatNode) {
      return;
    }

    this.toggleNode(node.key, 'checked', checked);

    // Necessary to toggle children/parent if cascade is enabled
    this.toggleChecked(node, checked);

    this.args.onCheck?.(
      this.serializeList('checked'),
      flatNode,
      this.flatNodes
    );
  }

  /**
   * Handles the expand event for a node.
   * @param {AkTreeNodeProps | undefined} node - The node information.
   * @memberof AkTreeProviderComponent
   */
  @action onExpand(node: AkTreeNodeProps | undefined) {
    const flatNode = this.getFlatNode(node?.key);

    if (!node || !flatNode || flatNode?.isLeaf) {
      return;
    }

    this.toggleNode(node.key, 'expanded', !node.expanded);

    this.args.onExpand?.(
      this.serializeList('expanded'),
      flatNode,
      this.flatNodes
    );
  }

  /**
   * Flattens the nodes for internal lookups.
   * @param {Array<N>} nodes - The nodes to flatten.
   * @param {N} [parent] - The parent node.
   * @param {number} [treeDepth=0] - The depth of the current node.
   * @memberof AkTreeProviderComponent
   */
  @action flattenNodes<N extends AkTreeNodeProps>(
    nodes: Array<N>,
    parent: N = {} as N,
    treeDepth: number = 0
  ) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return;
    }

    // Flatten the `node` property for internal lookups
    nodes.forEach((node, index) => {
      if (this.flatNodes[node.key] !== undefined) {
        throw new Error(
          `A duplicate key '${node.key}' was found multiple times. All node keys must be unique.`
        );
      }

      const isParent = this.nodeHasChildren(node);

      this.flatNodes[node.key] = {
        ...node,
        checked: !!node.checked,
        parent,
        isParent,
        isLeaf: !isParent,
        treeDepth,
        index,
        disabled: this.getDisabledState(node, parent),
        isChild: parent.key !== undefined,
        isRoot: treeDepth === 0,
        showCheckbox:
          node.showCheckbox !== undefined ? node.showCheckbox : true,
        hasParentSibling: !!parent.children?.some(
          (c) => (c.children?.length as number) >= 1
        ),
        indeterminate: false,
      };

      if (node.children) {
        this.flattenNodes(node.children, node, treeDepth + 1);
      }
    });

    return this;
  }

  /**
   * Deserializes the lists of expanded and checked nodes.
   * Initializes the expanded and checked properties of nodes based
   * on array of keys provided for the nodes in question.
   * @memberof AkTreeProviderComponent
   */
  @action deserializeLists() {
    const lists = { expanded: this.expanded, checked: this.checked };
    const listKeys = ['checked', 'expanded'] as const;

    listKeys.forEach((listKey) => {
      lists[listKey].forEach((value) => {
        const nodeValue = this.flatNodes[value];

        if (nodeValue !== undefined) {
          nodeValue[listKey] = true;
        }

        if (nodeValue?.isParent && listKey === 'checked') {
          this.toggleChecked(nodeValue, true);
        }
      });
    });

    // Resolve checked state in scenarios where checked array is empty by default but nodes have checked prop
    Object.keys(this.flatNodes).forEach((fNode) => {
      const nodeValue = this.flatNodes[fNode];
      const nodeIsChecked = nodeValue?.checked;

      if (!nodeIsChecked && nodeValue?.isParent) {
        nodeValue['checked'] = nodeValue.children?.every(
          (cFNode) => cFNode.checked
        );
      }
    });
  }

  /**
   * Toggles a node's checked or expanded state.
   * @param {string} key - The key of the node.
   * @param {'checked' | 'expanded'} nodeProp - The property to toggle.
   * @param {boolean} toggleValue - The value to toggle.
   * @memberof AkTreeProviderComponent
   */
  @action toggleNode(
    key: string,
    nodeProp: 'checked' | 'expanded',
    toggleValue: boolean
  ) {
    const flatNode = this.flatNodes[key];

    if (flatNode) {
      flatNode[nodeProp] = toggleValue;
    }
  }

  /**
   * Toggles the checked state of a node.
   * @param {AkTreeNodeProps} node - The node to toggle.
   * @param {boolean} isChecked - The checked state.
   * @param {boolean} [percolateUpward=true] - Whether to percolate the state upward.
   * @memberof AkTreeProviderComponent
   */
  @action toggleChecked(
    node: AkTreeNodeProps,
    isChecked: boolean,
    percolateUpward: boolean = true
  ) {
    const flatNode = this.flatNodes[node.key];

    if (flatNode?.isLeaf || !this.cascade) {
      if (node.disabled) {
        return;
      }

      this.toggleNode(node.key, 'checked', isChecked);
    } else {
      // Toggle parent check status if the model tracks this OR if it is an empty parent
      if (flatNode?.isChild || flatNode?.children?.length === 0) {
        this.toggleNode(node.key, 'checked', isChecked);
      }

      if (flatNode?.children) {
        // Percolate check status down to all children
        flatNode?.children?.forEach((child) => {
          this.toggleChecked(child, isChecked, false);
        });
      }
    }

    // Percolate check status up to parent
    // The check model must include parent nodes and we must not have already covered the
    // parent (relevant only when percolating through children)
    if (percolateUpward && this.cascade && flatNode?.isChild) {
      this.toggleParentStatus(flatNode.parent);
    }
  }

  /**
   * Toggles the checked status of the parent node based on the checked status of its children.
   * If the parent node is a child itself, the function recurses up the tree.
   *
   * @param {AkTreeNodeProps} node - The node whose parent's checked status needs to be toggled.
   * @memberof AkTreeProviderComponent
   */
  @action toggleParentStatus(node: AkTreeNodeProps) {
    const flatNode = this.flatNodes[node.key];

    if (flatNode?.isChild) {
      this.toggleNode(node.key, 'checked', this.isEveryChildChecked(flatNode));
      this.toggleParentStatus(flatNode.parent);
    } else {
      this.toggleNode(node.key, 'checked', this.isEveryChildChecked(flatNode));
    }
  }

  /**
   * Serializes the list of nodes that have a specified property (e.g., checked or expanded).
   *
   * @param {keyof AkTreeNodeFlattenedProps} serializeKey - The property to serialize (e.g., 'checked' or 'expanded').
   * @return {string[]} The list of node keys that have the specified property.
   * @memberof AkTreeProviderComponent
   */
  @action serializeList(
    serializeKey: keyof AkTreeNodeFlattenedProps
  ): string[] {
    const list: string[] = [];

    Object.keys(this.flatNodes).forEach((nodeKey) => {
      const flatNode = this.flatNodes[nodeKey];

      if (flatNode?.[serializeKey]) {
        list.push(nodeKey);
      }
    });

    return list;
  }

  /**
   * Checks if all children of a node are checked.
   *
   * @param {AkTreeNodeProps | undefined} node - The node whose children's checked status needs to be verified.
   * @return {boolean} Whether all children of the node are checked.
   * @memberof AkTreeProviderComponent
   */
  @action isEveryChildChecked(node: AkTreeNodeProps | undefined): boolean {
    return (
      node?.children?.every((child) => this.getFlatNode(child.key)?.checked) ||
      false
    );
  }

  /**
   * Checks if a node has children.
   * @param {AkTreeNodeProps} node - The node to check.
   * @return {boolean} Whether the node has children.
   * @memberof AkTreeProviderComponent
   */
  @action nodeHasChildren(node: AkTreeNodeProps): boolean {
    return Array.isArray(node.children);
  }

  /**
   * Gets the disabled state of a node.
   * @param {AkTreeNodeProps} node - The node to check.
   * @param {AkTreeNodeProps} parent - The parent node.
   * @return {boolean} Whether the node is disabled.
   * @memberof AkTreeProviderComponent
   */
  @action getDisabledState(
    node: AkTreeNodeProps,
    parent: AkTreeNodeProps
  ): boolean {
    if (this.disabled) {
      return true;
    }

    if (this.cascade && parent.disabled) {
      return true;
    }

    return Boolean(node.disabled);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkTree::Provider': typeof AkTreeProviderComponent;
  }
}
