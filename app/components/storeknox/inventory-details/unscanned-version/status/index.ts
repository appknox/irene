import Component from '@glimmer/component';
import type { AkChipColor } from 'irene/components/ak-chip';

interface StoreknoxInventoryDetailsUnscannedVersionStatusSignature {
  Element: HTMLDivElement;
  Args: {
    condition?: AkChipColor;
    label?: string;
  };
}

export default class StoreknoxInventoryDetailsUnscannedVersionStatusComponent extends Component<StoreknoxInventoryDetailsUnscannedVersionStatusSignature> {
  get showChip() {
    return this.args.condition && this.args.label;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::UnscannedVersion::Status': typeof StoreknoxInventoryDetailsUnscannedVersionStatusComponent;
  }
}
