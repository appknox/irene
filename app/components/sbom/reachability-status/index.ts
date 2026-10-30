import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type { AkChipColor } from 'irene/components/ak-chip';
import {
  reachabilityChipColor,
  reachabilityExplanationKey,
  reachabilityLabelKey,
  shouldShowReachabilityChip,
  verdictForExposure,
} from 'irene/utils/sbom-reachability';

import styles from './index.scss';

export interface SbomReachabilityStatusSignature {
  Args: {
    verdict?: string | null;
    /**
     * Engine exposure (CONFIRMED_EXPOSURE / POTENTIAL_EXPOSURE / …). When the
     * backend sends it, it is the headline: it already folds reachability and
     * condition verdicts into one customer-facing conclusion.
     */
    exposure?: string | null;
    /**
     * Closed-row mode: Unknown / Unsupported / missing verdict render as "-".
     */
    compact?: boolean;
    /**
     * Server-computed explanation (mycroft `customer_facing_summary`). When
     * present it replaces the generic verdict tooltip, so an Inconclusive
     * chip explains *why* it is inconclusive instead of stating that it is.
     */
    tooltip?: string | null;
  };
  Element: HTMLElement;
}

export default class SbomReachabilityStatusComponent extends Component<SbomReachabilityStatusSignature> {
  @service declare intl: IntlService;

  get styles() {
    return styles;
  }

  get verdict() {
    return verdictForExposure(this.args.exposure) ?? this.args.verdict ?? null;
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

  get explanation() {
    return (
      this.args.tooltip || this.intl.t(reachabilityExplanationKey(this.verdict))
    );
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
