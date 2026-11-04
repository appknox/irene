import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SbomVulnerabilityAuditModel from 'irene/models/sbom-vulnerability-audit';
import {
  ReachabilityVerdict,
  blockerCategoryKey,
  reachabilityChipColor,
  reachabilityExplanationKey,
  reachabilityLabelKey,
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
   * The target whose sections belong to the displayed path. The backend
   * promotes the first witness-bearing target, so prefer that one.
   */
  get explainedTarget() {
    const targets = this.reachability?.targets ?? [];

    return (
      targets.find((target) => target.narrative || target.reasoning) ??
      targets.find((target) => target.explanation) ??
      null
    );
  }

  /**
   * One plain-language sentence shown above the call path. Falls back to the
   * legacy single blob for findings explained before the section split.
   */
  get pathExplanation() {
    return (
      this.explainedTarget?.narrative ||
      this.explainedTarget?.explanation ||
      null
    );
  }

  /**
   * Why the engine reached this verdict. Model-written but gated server-side
   * against claims the call graph cannot support — the graph stays
   * authoritative, this only explains it.
   */
  get reasoning() {
    return this.explainedTarget?.reasoning || null;
  }

  /**
   * The model opens the paragraph with the raw verdict token. Split it out so
   * the UI shows the same chip it uses everywhere else instead of printing
   * POTENTIALLY_REACHABLE as prose.
   */
  private get reasoningParts() {
    const text = this.reasoning;

    if (!text) {
      return null;
    }

    const match = text.match(/^([A-Z][A-Z_]{3,})[.:]\s+([\s\S]+)$/);

    return match
      ? { verdict: match[1] as string, body: match[2] as string }
      : { verdict: null, body: text };
  }

  get reasoningVerdictLabel() {
    const verdict = this.reasoningParts?.verdict;

    return verdict ? this.intl.t(reachabilityLabelKey(verdict)) : null;
  }

  get reasoningVerdictColor() {
    return reachabilityChipColor(this.reasoningParts?.verdict);
  }

  get reasoningBody() {
    return this.reasoningParts?.body ?? null;
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
