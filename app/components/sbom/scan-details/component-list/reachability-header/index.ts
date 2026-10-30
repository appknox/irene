import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';

import { FindingExposure } from 'irene/utils/sbom-reachability';

interface SbomScanDetailsComponentListReachabilityHeaderComponentSignature {
  Args: {
    onReachabilityChange: (exposure: string | null) => void;
    selectedReachability?: string | null;
  };
}

export default class SbomScanDetailsComponentListReachabilityHeaderComponent extends Component<SbomScanDetailsComponentListReachabilityHeaderComponentSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get reachabilityOptions() {
    return [
      { key: this.intl.t('all'), value: null },
      {
        key: this.intl.t('sbomModule.reachability.pathFound'),
        value: FindingExposure.CONFIRMED,
      },
      {
        key: this.intl.t('sbomModule.reachability.potential'),
        value: FindingExposure.POTENTIAL,
      },
      {
        key: this.intl.t('sbomModule.reachability.noPathFound'),
        value: FindingExposure.NONE_OBSERVED,
      },
      {
        key: this.intl.t('sbomModule.reachability.inconclusive'),
        value: FindingExposure.UNKNOWN,
      },
      {
        key: this.intl.t('sbomModule.reachability.unsupported'),
        value: FindingExposure.UNSUPPORTED,
      },
    ];
  }

  get selectedReachability() {
    return this.args.selectedReachability ?? null;
  }

  get filterApplied() {
    return this.selectedReachability !== null;
  }

  @action handleClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action handleOptionsClose() {
    this.anchorRef = null;
  }

  @action selectReachability(value: string | null) {
    this.anchorRef = null;

    this.args.onReachabilityChange(value);
  }

  @action clearFilter() {
    this.anchorRef = null;

    this.args.onReachabilityChange(null);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::ReachabilityHeader': typeof SbomScanDetailsComponentListReachabilityHeaderComponent;
  }
}
