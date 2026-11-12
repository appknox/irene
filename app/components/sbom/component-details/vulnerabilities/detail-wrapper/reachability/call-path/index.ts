import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import {
  TargetPresence,
  WitnessOwnerKind,
  fixHereWitnessIndex,
  groupWitnessByOwner,
  isConfirmedFinding,
  isTargetCallStatusUnknown,
  reachabilityWitnessPathItems,
  splitWitnessNarrative,
  type SbomReachabilityFinding,
  type SbomReachabilityWitnessGroup,
  type SbomReachabilityWitnessItem,
} from 'irene/utils/sbom-reachability';

export interface SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityCallPathSignature {
  Args: {
    finding?: SbomReachabilityFinding | null;

    /** Prose describing the path in the app's own terms, shown above it. */
    narrative?: string | null;
  };
}

type CallPathStep = SbomReachabilityWitnessItem & {
  testIndex: number;
  isEntryPoint: boolean;
  isTarget: boolean;
  isFixHere: boolean;
  isMilestone: boolean;
  edgeLabel: string | null;
};

export default class SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityCallPathComponent extends Component<SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityCallPathSignature> {
  @service declare intl: IntlService;

  @tracked showFullSignatures = false;
  @tracked narrativeExpanded = false;
  @tracked narrativeOverflows = false;
  @tracked analysisDetailExpanded = false;

  @action
  toggleNarrative() {
    this.narrativeExpanded = !this.narrativeExpanded;
  }

  @action
  toggleAnalysisDetail() {
    this.analysisDetailExpanded = !this.analysisDetailExpanded;
  }

  /**
   * The engine narrative, split so the analyst half — which quotes raw
   * signatures — stays out of the reading flow.
   */
  get narrative() {
    return splitWitnessNarrative(this.args.narrative);
  }

  /**
   * Whether the narrative actually overflows its clamp.
   *
   * Measured rather than guessed from length: the panel is a fluid width, so
   * a character count showed "Show more" on text that already fitted.
   */
  @action
  measureNarrative(element: HTMLElement) {
    this.narrativeOverflows = element.scrollHeight - element.clientHeight > 1;
  }

  /** Collapsed text is always clamped, so the measurement has something to see. */
  get narrativeIsClamped() {
    return !this.narrativeExpanded;
  }

  @action
  selectShortNames() {
    this.showFullSignatures = false;
  }

  @action
  selectFullSignatures() {
    this.showFullSignatures = true;
  }

  get steps(): CallPathStep[] {
    const items = reachabilityWitnessPathItems(this.args.finding);
    const lastIndex = items.length - 1;
    const fixHereIndex = fixHereWitnessIndex(items);

    return items.map((item, index) => {
      const isEntryPoint = index === 0;
      const isTarget = index === lastIndex && items.length > 1;
      const isFixHere = index === fixHereIndex;

      return {
        ...item,
        testIndex: index,
        isEntryPoint,
        isTarget,
        isFixHere,
        isMilestone: isEntryPoint || isTarget || isFixHere,
        edgeLabel: item.edgeType
          ? item.edgeType.replaceAll('_', ' ').toLowerCase()
          : null,
      };
    });
  }

  get hasPath() {
    return this.steps.length > 0;
  }

  /**
   * A proven path marks the app's last frame as the place to fix; anything
   * less certain only points at where to look.
   */
  get fixHereLabel() {
    return isConfirmedFinding(this.args.finding)
      ? this.intl.t('sbomModule.reachability.fixHere')
      : this.intl.t('sbomModule.reachability.checkHere');
  }

  /** Only a confirmed fix point gets the red alarm; "check here" is amber. */
  get fixHereColor() {
    return isConfirmedFinding(this.args.finding) ? 'error' : 'warn';
  }

  /**
   * Nothing was traced, yet the finding names vulnerable functions and the
   * verdict is not a proven absence: say so instead of hiding the section.
   */
  get showNoTrace() {
    const finding = this.args.finding;
    const hasTargets =
      Boolean(finding?.target) ||
      (finding?.targets ?? []).some((target) => target.label);

    return !this.hasPath && hasTargets && isTargetCallStatusUnknown(finding);
  }

  /**
   * "Not found in the build" is only true when the engine did not observe
   * the vulnerable code. When it is present (analysis blocked) or was never
   * analysed, say neutrally that no path was recorded.
   */
  get noTraceKey() {
    return this.args.finding?.target_presence === TargetPresence.NOT_OBSERVED
      ? 'sbomModule.reachability.noTrace'
      : 'sbomModule.reachability.noTraceRecorded';
  }

  get shouldShow() {
    return this.hasPath || this.showNoTrace;
  }

  /**
   * The path split into owner runs. Without engine-supplied ownership this is
   * a single unlabelled group, which renders as the flat list it was before.
   */
  get groups() {
    return groupWitnessByOwner(this.steps).map((group, index) => ({
      ...group,
      testKey: index,
      isComponent: group.kind === WitnessOwnerKind.COMPONENT,
      headerLabel: this.headerLabel(group),
    }));
  }

  private headerLabel(group: SbomReachabilityWitnessGroup<CallPathStep>) {
    if (group.kind === WitnessOwnerKind.APP) {
      const yourCode = this.intl.t('sbomModule.reachability.yourCode');

      return group.label ? `${yourCode} · ${group.label}` : yourCode;
    }

    if (group.kind === WitnessOwnerKind.COMPONENT) {
      const label = group.label?.trim();

      return label
        ? this.intl.t('sbomModule.reachability.entersComponent', {
            component: label,
          })
        : this.intl.t('sbomModule.reachability.entersThirdPartyCode');
    }

    if (group.kind === WitnessOwnerKind.PLATFORM) {
      return (
        group.label?.trim() ||
        this.intl.t('sbomModule.reachability.platformCode')
      );
    }

    return null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Reachability::CallPath': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityCallPathComponent;
    'sbom/component-details/vulnerabilities/detail-wrapper/reachability/call-path': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityCallPathComponent;
  }
}
