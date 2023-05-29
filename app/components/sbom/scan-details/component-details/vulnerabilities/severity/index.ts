import Component from '@glimmer/component';
import SbomScanComponentVulnerabilityModel from 'irene/models/sbom-scan-component-vulnerability';

export interface SbomScanDetailsComponentDetailsVulnerabilitiesSeveritySignature {
  Args: {
    sbomScanComponentVulnerability: SbomScanComponentVulnerabilityModel;
  };
}

export default class SbomScanDetailsComponentDetailsVulnerabilitiesSeverityComponent extends Component<SbomScanDetailsComponentDetailsVulnerabilitiesSeveritySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'sbom/scan-details/component-details/vulnerabilities/severity': typeof SbomScanDetailsComponentDetailsVulnerabilitiesSeverityComponent;
  }
}
