import Component from '@glimmer/component';
import SbomScanComponentVulnerabilityModel, {
  VulnerabilitySeverity,
} from 'irene/models/sbom-scan-component-vulnerability';

export interface SbomScanDetailsComponentDetailsVulnerabilitiesCvssScoreSignature {
  Args: {
    sbomScanComponentVulnerability: SbomScanComponentVulnerabilityModel;
  };
}

export default class SbomScanDetailsComponentDetailsVulnerabilitiesCvssScoreComponent extends Component<SbomScanDetailsComponentDetailsVulnerabilitiesCvssScoreSignature> {
  get score() {
    return this.args.sbomScanComponentVulnerability.score;
  }

  get isUnknownSeverity() {
    return (
      this.args.sbomScanComponentVulnerability.severity ===
      VulnerabilitySeverity.UNKNOWN
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'sbom/scan-details/component-details/vulnerabilities/cvss-score': typeof SbomScanDetailsComponentDetailsVulnerabilitiesCvssScoreComponent;
  }
}
