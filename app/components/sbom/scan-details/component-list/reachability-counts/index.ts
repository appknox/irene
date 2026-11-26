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

const MAX_VISIBLE = 1;

type ReachabilityCount = {
  key: 'reachable' | 'potential' | 'inconclusive';
  label: string;
  count: number;
  strong?: boolean;
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

  /**
   * Only the outcomes that were found, strongest first and emphasised; zeros
   * are left out so a row shows what matters instead of a column of zeros.
   */
  get counts(): ReachabilityCount[] {
    return this.allCounts
      .filter((item) => item.count > 0)
      .map((item, index) => ({ ...item, strong: index === 0 }));
  }

  /** Only the strongest outcome stays in the row. */
  get visibleCounts() {
    return this.counts.slice(0, MAX_VISIBLE);
  }

  /** Everything beyond them folds into one "+N" marker. */
  get hiddenCounts() {
    return this.counts.slice(MAX_VISIBLE);
  }

  get hasHidden() {
    return this.hiddenCounts.length > 0;
  }

  get hiddenLabel() {
    return `+${this.hiddenCounts.length}`;
  }

  get hiddenTooltip() {
    return this.hiddenCounts
      .map((item) => `${item.label} ${item.count}`)
      .join('\n');
  }

  get hasCounts() {
    return this.counts.length > 0;
  }

  private get allCounts(): ReachabilityCount[] {
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
