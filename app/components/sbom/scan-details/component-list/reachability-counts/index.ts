import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomFileModel from 'irene/models/sbom-file';
import { ReachabilityScanStatus } from 'irene/utils/sbom-reachability';

export interface SbomScanDetailsComponentListReachabilityCountsSignature {
  Args: {
    sbomComponent: SbomComponentModel;
    sbomFile?: SbomFileModel;
  };
}

type ReachabilityCount = {
  key: 'reachable' | 'potential' | 'inconclusive';
  label: string;
  count: number;
};

export default class SbomScanDetailsComponentListReachabilityCountsComponent extends Component<SbomScanDetailsComponentListReachabilityCountsSignature> {
  @service declare intl: IntlService;

  get summary() {
    return this.args.sbomComponent.reachability;
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

  get hasSummary() {
    return Boolean(this.summary);
  }

  /**
   * One chip per outcome, always all three, so the columns line up down the
   * table and a zero reads as "none of these" rather than "not analysed".
   */
  get counts(): ReachabilityCount[] {
    const summary = this.summary;

    return [
      {
        key: 'reachable',
        label: this.intl.t('sbomModule.reachability.pathFound'),
        count: summary?.path_found_count ?? 0,
      },
      {
        key: 'potential',
        label: this.intl.t('sbomModule.reachability.potential'),
        count: summary?.potential_count ?? 0,
      },
      {
        key: 'inconclusive',
        label: this.intl.t('sbomModule.reachability.inconclusive'),
        count: summary?.unknown_count ?? 0,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::ReachabilityCounts': typeof SbomScanDetailsComponentListReachabilityCountsComponent;
    'sbom/scan-details/component-list/reachability-counts': typeof SbomScanDetailsComponentListReachabilityCountsComponent;
  }
}
