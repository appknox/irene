import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomVulnerabilityAuditModel from 'irene/models/sbom-vulnerability-audit';
import {
  ReachabilityVerdict,
  blockerCategoryKey,
  reachabilityChipColor,
  reachabilityChipVariant,
  reachabilityExplanationKey,
  reachabilityLabelKey,
  reachabilityNamedExplanationKey,
  shouldShowReachabilityDetail,
  tokenizeReasoning,
} from 'irene/utils/sbom-reachability';

export interface SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilitySignature {
  Args: {
    sbomVulnerabilityAudit: SbomVulnerabilityAuditModel;

    /** Used to name the app in the explanation copy; optional. */
    sbomComponent?: SbomComponentModel | null;

    /** Overrides the app name resolved from `sbomComponent`. */
    appName?: string | null;
  };
}

type ReasoningSegmentView = {
  isVerdict: boolean;
  text: string;
  color: ReturnType<typeof reachabilityChipColor>;
  variant: ReturnType<typeof reachabilityChipVariant>;
  /** Filled (Reachable) badges are bold everywhere, as in ReachabilityStatus. */
  fontWeight: 'bold' | 'regular';
};

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

  /**
   * The app's own name from its SBOM project, so the copy can say "LeafPic's
   * code" instead of "the app's code". Null until the project loads.
   */
  get appName() {
    if (this.args.appName) {
      return this.args.appName;
    }

    const project = this.args.sbomComponent?.sbFile?.get('sbProject');

    return (project?.get('name') as string | undefined)?.trim() || null;
  }

  get explanation() {
    // The server summary names the actual reason for inconclusive verdicts;
    // the translated key is the fallback for payloads without a summary.
    if (this.reachability?.summary) {
      return this.reachability.summary;
    }

    const verdict = this.reachability?.verdict;
    const namedKey = this.appName
      ? reachabilityNamedExplanationKey(verdict)
      : null;

    return namedKey
      ? this.intl.t(namedKey, { app: this.appName })
      : this.intl.t(reachabilityExplanationKey(verdict));
  }

  /**
   * The target whose sections belong to the displayed path. The backend
   * promotes the first witness-bearing target, so prefer that one.
   */
  get explainedTarget() {
    const targets = this.reachability?.targets ?? [];

    return (
      targets.find(
        (target) => target.has_witness && (target.narrative || target.reasoning)
      ) ??
      targets.find((target) => target.reasoning) ??
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
    // Always the explained target's own reasoning, never another target's.
    return this.explainedTarget?.reasoning || null;
  }

  /**
   * The reasoning paragraph split into prose and verdict runs. The model
   * names verdicts as raw tokens ("POTENTIALLY_REACHABLE") or as words
   * ("Inconclusive"); each becomes the same chip used everywhere else.
   * Rendered as text and components only — never as HTML.
   */
  get reasoningSegments(): ReasoningSegmentView[] {
    return tokenizeReasoning(this.reasoning).map((segment) => {
      if (segment.kind !== 'verdict') {
        return {
          isVerdict: false,
          text: segment.text,
          color: 'default',
          variant: 'semi-filled',
          fontWeight: 'regular',
        };
      }

      const variant = reachabilityChipVariant(segment.verdict);

      return {
        isVerdict: true,
        text: this.intl.t(reachabilityLabelKey(segment.verdict)),
        color: reachabilityChipColor(segment.verdict),
        variant,
        fontWeight: variant === 'filled' ? 'bold' : 'regular',
      };
    });
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
