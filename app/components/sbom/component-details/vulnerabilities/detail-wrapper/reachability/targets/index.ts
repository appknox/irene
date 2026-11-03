import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  formatDexSignature,
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
  @tracked showAlsoAffected = false;

  @action
  toggleAlsoAffected() {
    this.showAlsoAffected = !this.showAlsoAffected;
  }

  get split() {
    return splitFindingTargets(this.args.finding);
  }

  /** Vulnerable functions the app has a proven call path to. */
  get calledTargets() {
    return toRows(this.split.called);
  }

  /** Vulnerable functions in the build that nothing on the app's side calls. */
  get alsoAffectedTargets() {
    return toRows(this.split.alsoAffected);
  }

  get hasAlsoAffected() {
    return this.alsoAffectedTargets.length > 0;
  }

  get shouldShow() {
    return this.calledTargets.length > 0 || this.hasAlsoAffected;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Reachability::Targets': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityTargetsComponent;
    'sbom/component-details/vulnerabilities/detail-wrapper/reachability/targets': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperReachabilityTargetsComponent;
  }
}
