import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';

export interface AiConfidenceComponentSignature {
  Element: HTMLDivElement;
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class AiConfidenceComponent extends Component<AiConfidenceComponentSignature> {
  @service declare intl: IntlService;

  get explanation() {
    const key = this.args.sbomComponent.confidenceExplanationKey;
    return key ? this.intl.t(key) : null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::AiConfidence': typeof AiConfidenceComponent;
  }
}
