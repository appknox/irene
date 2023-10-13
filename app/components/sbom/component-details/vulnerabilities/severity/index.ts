import Component from '@glimmer/component';
import SbomVulnerabilityModel from 'irene/models/sbom-vulnerability';

export interface SbomComponentDetailsVulnerabilitiesSeveritySignature {
  Args: {
    sbomVulnerability: SbomVulnerabilityModel;
  };
}

export default class SbomComponentDetailsVulnerabilitiesSeverityComponent extends Component<SbomComponentDetailsVulnerabilitiesSeveritySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'sbom/component-details/vulnerabilities/severity': typeof SbomComponentDetailsVulnerabilitiesSeverityComponent;
  }
}
