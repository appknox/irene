import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';

import styles from './index.scss';

export interface SbomComponentDetailsSummaryReachabilitySignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

type ReachabilityCountItem = {
  key: string;
  label: string;
  count: number;
};

export default class SbomComponentDetailsSummaryReachabilityComponent extends Component<SbomComponentDetailsSummaryReachabilitySignature> {
  @service declare intl: IntlService;

  get styles() {
    return styles;
  }

  get reachability() {
    return this.args.sbomComponent.reachability;
  }

  get countItems(): ReachabilityCountItem[] {
    const reachability = this.reachability;

    return [
      {
        key: 'path-found',
        label: this.intl.t('sbomModule.reachability.pathFound'),
        count: reachability?.path_found_count ?? 0,
      },
      {
        key: 'potential',
        label: this.intl.t('sbomModule.reachability.potential'),
        count: reachability?.potential_count ?? 0,
      },
      {
        key: 'no-path-found',
        label: this.intl.t('sbomModule.reachability.noPathFound'),
        count: reachability?.no_path_found_count ?? 0,
      },
      {
        key: 'unknown',
        label: this.intl.t('unknown'),
        count: reachability?.unknown_count ?? 0,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'sbom/component-details/summary/reachability': typeof SbomComponentDetailsSummaryReachabilityComponent;
  }
}
