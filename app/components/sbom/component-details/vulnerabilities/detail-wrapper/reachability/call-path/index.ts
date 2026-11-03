import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import {
  NARRATIVE_CLAMP_THRESHOLD,
  WitnessOwnerKind,
  fixHereWitnessIndex,
  groupWitnessByOwner,
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

  get narrativeIsClampable() {
    return (this.narrative?.behavior.length ?? 0) > NARRATIVE_CLAMP_THRESHOLD;
  }

  get narrativeIsClamped() {
    return this.narrativeIsClampable && !this.narrativeExpanded;
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
      return this.intl.t('sbomModule.reachability.entersComponent', {
        component: group.label ?? '',
      });
    }

    if (group.kind === WitnessOwnerKind.PLATFORM) {
      return group.label ?? this.intl.t('sbomModule.reachability.platformCode');
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
