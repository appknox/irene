import Component from '@glimmer/component';
import SbomVulnerabilityModel, {
  VulnerabilitySeverity,
} from 'irene/models/sbom-vulnerability';

export interface SbomScanDetailsComponentDetailsVulnerabilitiesCvssScoreSignature {
  Args: {
    sbomVulnerability: SbomVulnerabilityModel;
  };
}

export default class SbomScanDetailsComponentDetailsVulnerabilitiesCvssScoreComponent extends Component<SbomScanDetailsComponentDetailsVulnerabilitiesCvssScoreSignature> {
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
    'sbom/scan-details/component-details/vulnerabilities/cvss-score': typeof SbomScanDetailsComponentDetailsVulnerabilitiesCvssScoreComponent;
  }
}
