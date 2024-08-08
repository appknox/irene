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
    label: [node: MergeObjects<N, AkTreeNodeFlattenedProps> | undefined];
  };
}

export default class AkCheckboxTreeComponent<
  N extends AkTreeNodeProps,
> extends Component<AkCheckboxTreeSignature<N>> {
  calculatePadding(treeDepth?: number) {
    const spacingFactor = treeDepth === 0 ? 1 : 1.25;

    return `${(Number(treeDepth) + 1) * spacingFactor}em`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkCheckboxTree: typeof AkCheckboxTreeComponent;
  }
}
