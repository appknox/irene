import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type { AkChipColor } from 'irene/components/ak-chip';
import {
  reachabilityChipColor,
  reachabilityLabelKey,
  shouldShowReachabilityChip,
} from 'irene/utils/sbom-reachability';

import styles from './index.scss';

export interface SbomReachabilityStatusSignature {
  Args: {
    verdict?: string | null;
    /**
     * Closed-row mode: Unknown / Unsupported / missing verdict render as "-".
     */
    compact?: boolean;
  };
  Element: HTMLElement;
}

export default class SbomReachabilityStatusComponent extends Component<SbomReachabilityStatusSignature> {
  @service declare intl: IntlService;

  get styles() {
    return styles;
  }

  get verdict() {
    return this.args.verdict ?? null;
  }

  get showChip() {
    if (this.args.compact) {
      return shouldShowReachabilityChip(this.verdict);
    }

    return true;
  }

  get label() {
    return this.intl.t(reachabilityLabelKey(this.verdict));
  }

  get color(): AkChipColor {
    return reachabilityChipColor(this.verdict);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ReachabilityStatus': typeof SbomReachabilityStatusComponent;
    'sbom/reachability-status': typeof SbomReachabilityStatusComponent;
  }
}
