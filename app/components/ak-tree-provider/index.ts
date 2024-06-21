import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';

// Base tree node shape
export interface AkTreeNodeProps {
  key: string;
  label: string;
  checked?: boolean;
  expanded?: boolean;
  showCheckbox?: boolean;
  disabled?: boolean;
  children?: Array<AkTreeNodeProps>;
}

export interface AkTreeNodeFlattenedProps extends AkTreeNodeProps {
  parent: AkTreeNodeProps;
  isChild: boolean;
  isParent: boolean;
  isLeaf: boolean;
  showCheckbox: boolean;
  treeDepth: number;
  index: number;
  isRoot: boolean;
  hasParentSibling: boolean;
  indeterminate?: boolean;
}

export type AkTreeProviderFlatNodes = Record<string, AkTreeNodeFlattenedProps>;

// Component Signature
type CheckExpandFuncType = (
  keys: Array<string>,
  node: AkTreeNodeFlattenedProps
) => void;

export interface AkTreeProviderSignatureArgs<N extends AkTreeNodeProps> {
  checkModel?: 'leaf' | 'all' | 'parent';
  treeData: Array<N>;
  expanded: Array<string>;
  checked: Array<string>;
  noCascade?: boolean;
  disabled?: boolean;
  onCheck: CheckExpandFuncType;
  onExpand: CheckExpandFuncType;
}

export interface AkTreeProviderDefaultBlockProps<N extends AkTreeNodeProps>
  extends Omit<
    AkTreeProviderSignatureArgs<N>,
    'treeData' | 'onCheck' | 'onExpand'
  > {
  nodes: Array<N>;
  flatNodes: AkTreeProviderFlatNodes;
  getFlatNode(key?: string): AkTreeNodeFlattenedProps | undefined;
  onExpand(node: AkTreeNodeProps | undefined): void;

  // Event and checked state received from AkCheckbox
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
 */
export default class AkTreeProviderComponent<
  N extends AkTreeNodeProps,
> extends Component<AkTreeProviderSignature<N>> {
  /**
   * Flattened representation of the tree nodes for internal lookup.
   * @type {AkTreeProviderFlatNodes}
   */
  @tracked flatNodes: AkTreeProviderFlatNodes = {};

  // Defines the behavior of node checking.
  CHECK_MODEL = {
    ALL: 'all',
    PARENT: 'parent',
    LEAF: 'leaf',
  };

  constructor(owner: unknown, args: AkTreeProviderSignature<N>['Args']) {
    super(owner, args);

    this.flattenNodes(this.args.treeData);
    this.deserializeLists();

    console.log(this.flatNodes);
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

  get noCascade() {
    return this.args.noCascade || false;
  }

  get checkModel() {
    return this.args.checkModel || 'all';
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

    this.toggleChecked(node, checked);
    this.args.onCheck?.(this.serializeList('checked'), {
      ...flatNode,
      ...node,
    });
  }

  /**
   * Handles the expand event for a node.
   * @param {AkTreeNodeProps | undefined} node - The node information.
   * @memberof AkTreeProviderComponent
   */
  @action onExpand(node: AkTreeNodeProps | undefined) {
    const flatNode = this.getFlatNode(node?.key);

    if (!node || !flatNode) {
      return;
    }

    this.toggleNode(node.key, 'expanded', !node.expanded);
    this.args.onExpand?.(this.serializeList('expanded'), {
      ...flatNode,
      ...node,
    });
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

    if (!this.noCascade && parent.disabled) {
      return true;
    }

    return Boolean(node.disabled);
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
      return this;
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
        hasParentSibling: parent.children?.some(
          (c) => (c.children?.length as number) >= 1
        ),
      } as AkTreeNodeFlattenedProps;

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

    Object.keys(this.flatNodes).forEach((value) => {
      listKeys.forEach((listKey) => {
        const nodeValue = this.flatNodes[value];

        if (nodeValue) {
          nodeValue[listKey] = false;
        }
      });
    });

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

    Object.keys(this.flatNodes).forEach((key) => {
      const flatNode = this.flatNodes[key];

      if (flatNode) {
        flatNode['indeterminate'] =
          flatNode.children?.some((c) => this.flatNodes[c.key]?.checked) &&
          !flatNode.children?.every((c) => !this.flatNodes[c.key]?.checked);
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

    const { ALL, PARENT, LEAF } = this.CHECK_MODEL;
    const modelHasParents = [PARENT, ALL].indexOf(this.checkModel) > -1;
    const modelHasLeaves = [LEAF, ALL].indexOf(this.checkModel) > -1;

    if (flatNode?.isLeaf || this.noCascade) {
      if (node.disabled) {
        return;
      }

      this.toggleNode(node.key, 'checked', isChecked);
    } else {
      // Toggle parent check status if the model tracks this OR if it is an empty parent
      if (modelHasParents || flatNode?.children?.length === 0) {
        this.toggleNode(node.key, 'checked', isChecked);
      }

      if (modelHasLeaves) {
        // Percolate check status down to all children
        flatNode?.children?.forEach((child) => {
          this.toggleChecked(child, isChecked, false);
        });
      }
    }

    // Percolate check status up to parent
    // The check model must include parent nodes and we must not have already covered the
    // parent (relevant only when percolating through children)
    if (
      percolateUpward &&
      !this.noCascade &&
      flatNode?.isChild &&
      modelHasParents
    ) {
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
      if (this.checkModel === this.CHECK_MODEL.ALL) {
        this.toggleNode(
          node.key,
          'checked',
          this.isEveryChildChecked(flatNode)
        );
      }

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

    Object.keys(this.flatNodes).forEach((key) => {
      const flatNode = this.flatNodes[key];
      if (flatNode?.[serializeKey]) {
        list.push(key);
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkTreeProvider: typeof AkTreeProviderComponent;
  }
}
