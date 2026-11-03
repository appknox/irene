import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SbomVulnerabilityAuditModel from 'irene/models/sbom-vulnerability-audit';
import {
  ReachabilityVerdict,
  blockerCategoryKey,
  reachabilityExplanationKey,
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

  get explanation() {
    // The server summary names the actual reason for inconclusive verdicts;
    // the translated key is the fallback for payloads without a summary.
    return (
      this.reachability?.summary ||
      this.intl.t(reachabilityExplanationKey(this.reachability?.verdict))
    );
  }

  /**
   * Optional AI-assisted prose for the displayed witness path. The backend
   * promotes the first witness-bearing target's path, and only targets with a
   * witness carry explanations — so the first present explanation belongs to
   * the same target as the shown path. The call graph stays authoritative —
   * this is an annotation, not a verdict.
   */
  get pathExplanation() {
    return (
      this.reachability?.targets?.find((target) => target.explanation)
        ?.explanation || null
    );
  }

  get blockers(): ReachabilityBlocker[] {
    const blockersByCategory = new Map<string, ReachabilityBlocker>();

    for (const code of this.reachability?.blockers ?? []) {
      const categoryKey = blockerCategoryKey(code);

      if (!blockersByCategory.has(categoryKey)) {
        blockersByCategory.set(categoryKey, {
          code,
          label: this.intl.t(categoryKey),
        });
      }
    }

    return [...blockersByCategory.values()];
  }

  /**
   * The whole finding boils down to "no function-level data" — the
   * explanation line already says that, so the blocker chip is redundant.
   */
  get onlyTargetDataMissing() {
    const blockers = this.reachability?.blockers ?? [];

    return blockers.length === 1 && blockers[0] === 'TARGET_DATA_MISSING';
  }

  get hasBlockers() {
    // "Why this is inconclusive" only makes sense while the verdict itself is
    // inconclusive. Decided verdicts — including Potential, whose story is
    // told by the call path's edge chips — keep blockers for support only.
    return (
      this.blockers.length > 0 &&
      !this.onlyTargetDataMissing &&
      this.reachability?.verdict === ReachabilityVerdict.UNKNOWN
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Reachability': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityComponent;
    'sbom/component-details/vulnerabilities/detail-wrapper/reachability': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityComponent;
  }
}
