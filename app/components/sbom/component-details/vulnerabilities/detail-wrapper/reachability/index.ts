import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SbomVulnerabilityAuditModel from 'irene/models/sbom-vulnerability-audit';
import {
  blockerLabelKey,
  reachabilityWitnessSteps,
  shouldShowReachabilityDetail,
} from 'irene/utils/sbom-reachability';

export interface SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilitySignature {
  Args: {
    sbomVulnerabilityAudit: SbomVulnerabilityAuditModel;
  };
}

type ReachabilityBlocker = {
  code: string;
  label: string;
};

export default class SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityComponent extends Component<SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilitySignature> {
  @service declare intl: IntlService;

  get reachability() {
    return this.args.sbomVulnerabilityAudit.reachability;
  }

  get shouldShow() {
    return shouldShowReachabilityDetail(this.reachability);
  }

  get target() {
    return this.reachability?.target || null;
  }

  get witnessSteps() {
    return reachabilityWitnessSteps(this.reachability?.witness_path);
  }

  get witnessPathItems() {
    return this.witnessSteps.map((step, index) => ({
      step,
      testIndex: index,
      showArrow: index > 0,
    }));
  }

  get hasWitnessPath() {
    return this.witnessSteps.length > 0;
  }

  get blockers(): ReachabilityBlocker[] {
    return (this.reachability?.blockers ?? []).map((code) => {
      const key = blockerLabelKey(code);

      return {
        code,
        label: key ? this.intl.t(key) : code,
      };
    });
  }

  get hasBlockers() {
    return this.blockers.length > 0;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Reachability': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityComponent;
    'sbom/component-details/vulnerabilities/detail-wrapper/reachability': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityComponent;
  }
}
