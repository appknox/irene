import Component from '@glimmer/component';
import { action } from '@ember/object';

import {
  type AkTreeNodeFlattenedProps,
  type AkTreeNodeProps,
  type AkTreeProviderDefaultBlockProps,
} from 'irene/components/ak-tree/provider';

export interface AkTreeNodesSignature<N extends AkTreeNodeProps> {
  Args: {
    treeData: Array<N> | undefined;
    tree: AkTreeProviderDefaultBlockProps<N>;
  };
  Blocks: {
    default: [node: AkTreeNodeFlattenedProps | undefined];
  };
}

export default class AkTreeNodesComponent<
  N extends AkTreeNodeProps,
> extends Component<AkTreeNodesSignature<N>> {
  get tree() {
    return this.args.tree;
  }

  /**
   * Retrieves the flattened representation of a node by its key and sets its indeterminate state.
   *
   * @param {string} [key] - The key of the node to retrieve.
   * @return {AkTreeNodeFlattenedProps | undefined} The original node object and plus the flattened node props.
   * @memberof AkTreeNodesComponent
   */
  @action getFlatNode(key?: string): AkTreeNodeFlattenedProps | undefined {
    const flatNode = this.tree.getFlatNode(key);

    if (this.tree.cascade) {
      this.setIndeterminateState(flatNode);
    }

    return flatNode;
  }

  /**
   * Sets the indeterminate state of a node based on the checked status of its children.
   * A node is considered indeterminate if it has at least one checked child but not all children are checked.
   *
   * @param {AkTreeNodeFlattenedProps} [flatNode] - The node whose indeterminate state needs to be set.
   * @memberof AkTreeNodesComponent
   */
  @action setIndeterminateState(flatNode?: AkTreeNodeFlattenedProps) {
    if (flatNode?.children?.length) {
      let checkedNodes = 0;
      let disabledNodes = 0;

      flatNode.children.forEach((c) => {
        const cFlatNode = this.tree.getFlatNode(c.key);

        if (cFlatNode?.checked) {
          checkedNodes++;
        }

        if (cFlatNode?.disabled) {
          disabledNodes++;
        }
      });

      flatNode.indeterminate =
        checkedNodes > 0 &&
        checkedNodes < flatNode.children.length - disabledNodes;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkTree::Nodes': typeof AkTreeNodesComponent;
  }
}
