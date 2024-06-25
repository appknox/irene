import Component from '@glimmer/component';

import {
  type AkTreeNodeFlattenedProps,
  type AkTreeNodeProps,
  type AkTreeProviderDefaultBlockProps,
  type AkTreeProviderSignature,
} from 'irene/components/ak-tree/provider';

export interface AkTreeSignature<N extends AkTreeNodeProps>
  extends Omit<AkTreeProviderSignature<N>, 'Blocks'> {
  Blocks: {
    default: [
      node: AkTreeNodeFlattenedProps | undefined,
      tree: AkTreeProviderDefaultBlockProps<N>,
    ];
  };
}

export default class AkTreeComponent<
  N extends AkTreeNodeProps,
> extends Component<AkTreeSignature<N>> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkTree: typeof AkTreeComponent;
  }
}
