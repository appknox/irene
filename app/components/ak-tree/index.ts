import { action } from '@ember/object';
import Component from '@glimmer/component';

import type {
  AkTreeNodeFlattenedProps,
  AkTreeNodeProps,
  AkTreeProviderDefaultBlockProps,
} from 'irene/components/ak-tree-provider';

export interface AkTreeSignature<N extends AkTreeNodeProps> {
  Args: {
    treeData: Array<N> | undefined;
    tree: AkTreeProviderDefaultBlockProps<N>;
  };
  Blocks: {
    default: [node: MergeObjects<N, AkTreeNodeFlattenedProps> | undefined];
  };
}

export default class AkTreeComponent<
  N extends AkTreeNodeProps,
> extends Component<AkTreeSignature<N>> {
  get tree() {
    return this.args.tree;
  }

  // Gets the flattened representation of a node
  @action getFlatNode(key?: string) {
    return this.tree.getFlatNode(key) as MergeObjects<
      N,
      AkTreeNodeFlattenedProps
    >;
  }

  // Returns the children of a node
  @action getNodeChildren(node: AkTreeNodeProps) {
    return node?.children || [];
  }

  // Checks whether to show children nodes or not
  @action getShowChildrenNodes(
    node: AkTreeNodeProps,
    flatNode?: MergeObjects<N, AkTreeNodeFlattenedProps>
  ) {
    return node.children?.length && flatNode?.expanded;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkTree: typeof AkTreeComponent;
  }
}
