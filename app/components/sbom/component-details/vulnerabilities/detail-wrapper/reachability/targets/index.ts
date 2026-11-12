import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  formatDexSignature,
  isTargetCallStatusUnknown,
  splitFindingTargets,
  type SbomReachabilityFinding,
  type SbomReachabilityTarget,
} from 'irene/utils/sbom-reachability';

export interface SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityTargetsSignature {
  Args: {
    finding?: SbomReachabilityFinding | null;
  };
}

type TargetRow = {
  testIndex: number;
  display: string;
  signature: string;
};

function toRows(targets: SbomReachabilityTarget[]): TargetRow[] {
  return targets
    .filter((target) => target.label)
    .map((target, index) => ({
      testIndex: index,
      signature: target.label as string,
      display: formatDexSignature(target.label as string),
    }));
}

export default class SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityTargetsComponent extends Component<SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityTargetsSignature> {
  @tracked showCalled = true;
  @tracked showAlsoAffected = false;
  @tracked showUnknownStatus = true;

  @action
  toggleCalled() {
    this.showCalled = !this.showCalled;
  }

  @action
  toggleAlsoAffected() {
    this.showAlsoAffected = !this.showAlsoAffected;
  }

  @action
  toggleUnknownStatus() {
    this.showUnknownStatus = !this.showUnknownStatus;
  }

  /**
   * Inconclusive or untraced findings cannot say which functions are called,
   * so they get one neutral list instead of a misleading called/not-called
   * split.
   */
  get isCallStatusUnknown() {
    return isTargetCallStatusUnknown(this.args.finding);
  }

  /** Every vulnerable function, for the neutral "call status unknown" list. */
  get unknownStatusTargets() {
    return this.isCallStatusUnknown
      ? toRows(this.args.finding?.targets ?? [])
      : [];
  }

  get split() {
    return splitFindingTargets(this.args.finding);
  }

  /** Vulnerable functions the app has a proven call path to. */
  get calledTargets() {
    return this.isCallStatusUnknown ? [] : toRows(this.split.called);
  }

  /** Vulnerable functions in the build that nothing on the app's side calls. */
  get alsoAffectedTargets() {
    return this.isCallStatusUnknown ? [] : toRows(this.split.alsoAffected);
  }

  get hasAlsoAffected() {
    return this.alsoAffectedTargets.length > 0;
  }

  get shouldShow() {
    return (
      this.calledTargets.length > 0 ||
      this.hasAlsoAffected ||
      this.unknownStatusTargets.length > 0
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Reachability::Targets': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityTargetsComponent;
    'sbom/component-details/vulnerabilities/detail-wrapper/reachability/targets': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityTargetsComponent;
  }
}
