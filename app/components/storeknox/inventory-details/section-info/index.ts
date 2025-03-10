import Component from '@glimmer/component';
import { AkStackArgs } from 'irene/components/ak-stack';

interface StoreknoxInventoryDetailsSectionInfoSignature {
  Element: HTMLElement;
  Args: Pick<
    AkStackArgs,
    'width' | 'justifyContent' | 'alignItems' | 'direction' | 'spacing'
  >;
  Blocks: {
    default: [];
  };
}

export default class StoreknoxInventoryDetailsSectionInfoComponent extends Component<StoreknoxInventoryDetailsSectionInfoSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::SectionInfo': typeof StoreknoxInventoryDetailsSectionInfoComponent;
  }
}
