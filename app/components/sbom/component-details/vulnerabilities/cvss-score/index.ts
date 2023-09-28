import Component from '@glimmer/component';
import SbomVulnerabilityModel, {
  VulnerabilitySeverity,
} from 'irene/models/sbom-vulnerability';

export interface SbomComponentDetailsVulnerabilitiesCvssScoreSignature {
  Args: {
    sbomVulnerability: SbomVulnerabilityModel;
  };
}

export default class SbomComponentDetailsVulnerabilitiesCvssScoreComponent extends Component<SbomComponentDetailsVulnerabilitiesCvssScoreSignature> {
  get score() {
    return this.args.sbomVulnerability.score;
  }

  get isUnknownSeverity() {
    return (
      this.args.sbomVulnerability.severity === VulnerabilitySeverity.UNKNOWN
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'sbom/component-details/vulnerabilities/cvss-score': typeof SbomComponentDetailsVulnerabilitiesCvssScoreComponent;
  }
}
