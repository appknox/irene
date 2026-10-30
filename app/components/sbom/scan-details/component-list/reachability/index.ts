import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomFileModel from 'irene/models/sbom-file';
import {
  ReachabilityScanStatus,
  TargetPresence,
} from 'irene/utils/sbom-reachability';

export interface SbomScanDetailsComponentListReachabilitySignature {
  Args: {
    sbomComponent: SbomComponentModel;
    sbomFile?: SbomFileModel;
  };
}

export default class SbomScanDetailsComponentListReachabilityComponent extends Component<SbomScanDetailsComponentListReachabilitySignature> {
  @service declare intl: IntlService;

  get summary() {
    return this.args.sbomComponent.reachability;
  }

  get verdict() {
    return this.summary?.verdict ?? null;
  }

  get exposure() {
    return this.summary?.exposure ?? null;
  }

  private get sbFile(): SbomFileModel | null {
    return this.args.sbomFile ?? null;
  }

  get scanStatus() {
    return this.sbFile?.reachabilityStatus ?? null;
  }

  get scanning() {
    return (
      this.scanStatus === ReachabilityScanStatus.PENDING ||
      this.scanStatus === ReachabilityScanStatus.IN_PROGRESS
    );
  }

  /** FAILED / SKIPPED runs render as a muted dash with the reason on hover. */
  get scanNotRun() {
    return (
      this.scanStatus === ReachabilityScanStatus.FAILED ||
      this.scanStatus === ReachabilityScanStatus.SKIPPED
    );
  }

  get scanStatusReason() {
    return this.sbFile?.reachabilityError || null;
  }

  /** Declared in the SBOM but the engine didn't find its code in the binary. */
  get notInBinary() {
    return (
      this.summary?.code_presence === TargetPresence.NOT_OBSERVED &&
      !this.scanning
    );
  }

  /** "n/m" advisories with a found path; shown only for multi-advisory rows. */
  get countsBadge() {
    const summary = this.summary;

    if (!summary || summary.advisory_count <= 1) {
      return null;
    }

    return `${summary.path_found_count}/${summary.advisory_count}`;
  }

  /** Completed scan with no vulnerable findings: nothing to analyze. */
  get notApplicable() {
    return (
      this.scanStatus === ReachabilityScanStatus.COMPLETED && !this.summary
    );
  }

  /** Bucket breakdown across the component's advisories, e.g. "2 Reachable · 1 …". */
  get summaryTooltip() {
    const summary = this.summary;

    if (!summary) {
      return null;
    }

    return [
      `${summary.path_found_count} ${this.intl.t('sbomModule.reachability.pathFound')}`,
      `${summary.potential_count ?? 0} ${this.intl.t('sbomModule.reachability.potential')}`,
      `${summary.no_path_found_count ?? 0} ${this.intl.t('sbomModule.reachability.noPathFound')}`,
      `${summary.unknown_count ?? 0} ${this.intl.t('sbomModule.reachability.inconclusive')}`,
    ].join(' · ');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::Reachability': typeof SbomScanDetailsComponentListReachabilityComponent;
    'sbom/scan-details/component-list/reachability': typeof SbomScanDetailsComponentListReachabilityComponent;
  }
}
