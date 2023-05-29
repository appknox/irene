import Component from '@glimmer/component';
import SbomVulnerabilityModel from 'irene/models/sbom-vulnerability';

export interface SbomScanDetailsComponentDetailsVulnerabilitiesSeveritySignature {
  Args: {
    sbomVulnerability: SbomVulnerabilityModel;
  };
}

export default class SbomScanDetailsComponentDetailsVulnerabilitiesSeverityComponent extends Component<SbomScanDetailsComponentDetailsVulnerabilitiesSeveritySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'sbom/scan-details/component-details/vulnerabilities/severity': typeof SbomScanDetailsComponentDetailsVulnerabilitiesSeverityComponent;
  }
}
