import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';

export interface AiArtifactComponentSignature {
  Element: HTMLDivElement;
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class AiArtifactComponent extends Component<AiArtifactComponentSignature> {
  @service declare intl: IntlService;

  get aiLabel() {
    const component = this.args.sbomComponent;
    if (!component.aiDisplayLabelKey) {
      return null;
    }
    return this.intl.t(component.aiDisplayLabelKey);
  }

  get confidenceColor() {
    const confidence = this.args.sbomComponent.aiConfidence;
    if (confidence === 'high') return 'success';
    if (confidence === 'medium') return 'warning';
    return 'default';
  }

  get confidenceLabel() {
    const confidence = this.args.sbomComponent.aiConfidence;
    if (confidence === 'high') return 'High';
    if (confidence === 'medium') return 'Medium';
    if (confidence === 'low') return 'Low';
    return null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::AiArtifact': typeof AiArtifactComponent;
  }
}
