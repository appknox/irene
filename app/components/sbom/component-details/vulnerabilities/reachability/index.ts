import Component from '@glimmer/component';
import type SbomVulnerabilityAuditModel from 'irene/models/sbom-vulnerability-audit';

export interface SbomComponentDetailsVulnerabilitiesReachabilitySignature {
  Args: {
    sbomVulnerabilityAudit?: SbomVulnerabilityAuditModel | null;
  };
}

export default class SbomComponentDetailsVulnerabilitiesReachabilityComponent extends Component<SbomComponentDetailsVulnerabilitiesReachabilitySignature> {
  get verdict() {
    return this.args.sbomVulnerabilityAudit?.reachability?.verdict ?? null;
  }

  /**
   * Server-computed explanation: for inconclusive verdicts this names the
   * actual reason (from the blocker taxonomy) instead of a generic line.
   */
  get tooltip() {
    return this.args.sbomVulnerabilityAudit?.reachability?.summary ?? null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'sbom/component-details/vulnerabilities/reachability': typeof SbomComponentDetailsVulnerabilitiesReachabilityComponent;
  }
}
