import Component from '@glimmer/component';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomFileModel from 'irene/models/sbom-file';
import { ReachabilityScanStatus } from 'irene/utils/sbom-reachability';

export interface SbomScanDetailsComponentListReachabilitySignature {
  Args: {
    sbomComponent: SbomComponentModel;
    sbomFile?: SbomFileModel;
  };
}

export default class SbomScanDetailsComponentListReachabilityComponent extends Component<SbomScanDetailsComponentListReachabilitySignature> {
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
    return (
      this.args.sbomFile ??
      (this.args.sbomComponent
        ?.belongsTo('sbFile')
        .value() as SbomFileModel | null)
    );
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

  /** FAILED / SKIPPED / TIMED_OUT runs render as a muted dash with the reason on hover. */
  get scanNotRun() {
    return (
      this.scanStatus === ReachabilityScanStatus.FAILED ||
      this.scanStatus === ReachabilityScanStatus.SKIPPED ||
      this.scanStatus === ReachabilityScanStatus.TIMED_OUT
    );
  }

  get scanStatusReason() {
    return this.sbFile?.reachabilityError || null;
  }

  /** Completed scan with no vulnerable findings: nothing to analyze. */
  get notApplicable() {
    return (
      this.scanStatus === ReachabilityScanStatus.COMPLETED && !this.summary
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::Reachability': typeof SbomScanDetailsComponentListReachabilityComponent;
    'sbom/scan-details/component-list/reachability': typeof SbomScanDetailsComponentListReachabilityComponent;
  }
}
