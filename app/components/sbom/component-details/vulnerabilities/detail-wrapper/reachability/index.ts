import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SbomVulnerabilityAuditModel from 'irene/models/sbom-vulnerability-audit';
import {
  blockerCategoryKey,
  formatDexSignature,
  isInconclusiveVerdict,
  presenceLabelKey,
  reachabilityExplanationKey,
  reachabilityWitnessItems,
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

  get targetDisplay() {
    return this.target ? formatDexSignature(this.target) : null;
  }

  /**
   * Targets beyond the headline one — the engine can pin several variants per
   * vulnerability and the finding only promotes the first.
   */
  get extraTargets() {
    return (this.reachability?.targets ?? [])
      .slice(1)
      .map((target) => (target.label ? formatDexSignature(target.label) : null))
      .filter(Boolean) as string[];
  }

  get extraTargetsList() {
    return this.extraTargets.join('\n');
  }

  get explanation() {
    // The server summary names the actual reason for inconclusive verdicts;
    // the translated key is the fallback for payloads without a summary.
    return (
      this.reachability?.summary ||
      this.intl.t(reachabilityExplanationKey(this.reachability?.verdict))
    );
  }

  get presenceLabel() {
    const presence = this.reachability?.target_presence;

    return presence ? this.intl.t(presenceLabelKey(presence)) : null;
  }

  get witnessPathItems() {
    const items = reachabilityWitnessItems(this.reachability?.witness_path);
    const lastIndex = items.length - 1;

    return items.map((item, index) => ({
      ...item,
      testIndex: index,
      showArrow: index > 0,
      isEntryPoint: index === 0,
      isTarget: index === lastIndex && items.length > 1,
      edgeLabel: item.edgeType
        ? item.edgeType.replaceAll('_', ' ').toLowerCase()
        : null,
    }));
  }

  get hasWitnessPath() {
    return this.witnessPathItems.length > 0;
  }

  /**
   * Optional AI-assisted prose for the headline target's witness path. The
   * call graph stays authoritative — this is an annotation, not a verdict.
   */
  get pathExplanation() {
    return this.reachability?.targets?.[0]?.explanation || null;
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
   * explanation line already says that, so the empty target box and the
   * blocker chip are redundant.
   */
  get onlyTargetDataMissing() {
    const blockers = this.reachability?.blockers ?? [];

    return blockers.length === 1 && blockers[0] === 'TARGET_DATA_MISSING';
  }

  get hasBlockers() {
    // "Why this is inconclusive" only makes sense while the verdict itself is
    // inconclusive; conclusive findings keep their blockers for support only.
    return (
      this.blockers.length > 0 &&
      !this.onlyTargetDataMissing &&
      isInconclusiveVerdict(this.reachability?.verdict)
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Reachability': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityComponent;
    'sbom/component-details/vulnerabilities/detail-wrapper/reachability': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityComponent;
  }
}
