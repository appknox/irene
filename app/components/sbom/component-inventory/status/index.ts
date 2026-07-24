import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';

import SbomComponentInventoryModel from 'irene/models/sbom-component-inventory';

export interface SbomComponentInventoryStatusSignature {
  Args: {
    sbomComponent: SbomComponentInventoryModel | null;
  };
}

export default class SbomComponentInventoryStatusComponent extends Component<SbomComponentInventoryStatusSignature> {
  @service declare intl: IntlService;

  /** Status is only meaningful for versioned components. */
  get showStatus() {
    return Boolean(this.args.sbomComponent?.hasVersion);
  }

  get isVulnerable() {
    return Boolean(this.args.sbomComponent?.isVulnerable);
  }

  get label() {
    return this.isVulnerable
      ? this.intl.t('chipStatus.vulnerable')
      : this.intl.t('chipStatus.secure');
  }

  get color(): 'primary' | 'success' {
    return this.isVulnerable ? 'primary' : 'success';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInventory::Status': typeof SbomComponentInventoryStatusComponent;
    'sbom/component-inventory/status': typeof SbomComponentInventoryStatusComponent;
  }
}
