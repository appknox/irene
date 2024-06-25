import Component from '@glimmer/component';

import {
  type AkTreeNodeFlattenedProps,
  type AkTreeNodeProps,
  type AkTreeProviderDefaultBlockProps,
  type AkTreeProviderSignatureArgs,
} from 'irene/components/ak-tree/provider';

export interface AkCheckboxTreeSignature<N extends AkTreeNodeProps> {
  Args: AkTreeProviderSignatureArgs<N>;
  Blocks: {
    default: [
      node: MergeObjects<N, AkTreeNodeFlattenedProps> | undefined,
      tree: AkTreeProviderDefaultBlockProps<N>,
    ];
  };
}

export default class AkCheckboxTreeComponent<
  N extends AkTreeNodeProps,
> extends Component<AkCheckboxTreeSignature<N>> {
  calculatePadding(treeDepth?: number) {
    return `${Number(treeDepth) * 1}em`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkCheckboxTree: typeof AkCheckboxTreeComponent;
  }
}
