import Component from '@glimmer/component';
import type SbomVulnerabilityModel from 'irene/models/sbom-vulnerability';
import { VulnerabilitySeverity } from 'irene/models/sbom-vulnerability';

export interface SbomComponentDetailsVulnerabilitiesCvssScoreSignature {
  Args: {
    sbomVulnerability: SbomVulnerabilityModel;
  };
}

export default class SbomComponentDetailsVulnerabilitiesCvssScoreComponent extends Component<SbomComponentDetailsVulnerabilitiesCvssScoreSignature> {
  get score() {
    return this.args.sbomVulnerability.effectiveScore;
  }

  get isUnknownSeverity() {
    return (
      this.args.sbomVulnerability.effectiveSeverity ===
      VulnerabilitySeverity.UNKNOWN
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'sbom/component-details/vulnerabilities/cvss-score': typeof SbomComponentDetailsVulnerabilitiesCvssScoreComponent;
  }
}
