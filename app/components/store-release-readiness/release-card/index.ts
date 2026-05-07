import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type StoreReleaseReadinessScanModel from 'irene/models/store-release-readiness-scan';

export interface StoreReleaseReadinessReleaseCardSignature {
  Args: {
    item: StoreReleaseReadinessScanModel;
  };
}

type HeaderStatusMeta = {
  label: string;
  iconName: 'cancel' | 'check-circle' | 'hourglass-top' | 'do-not-disturb-on';
  iconColor: 'textSecondary' | 'success' | 'error' | 'warn';
};

export default class StoreReleaseReadinessReleaseCardComponent extends Component<StoreReleaseReadinessReleaseCardSignature> {
  @service declare intl: IntlService;

  get riskChipClass() {
    switch (this.args.item.verdict) {
      case ENUMS.STORE_RELEASE_VERDICT.HIGH_REJECTION_RISK:
        return 'risk-chip-high';
      case ENUMS.STORE_RELEASE_VERDICT.MODERATE_REJECTION_RISK:
        return 'risk-chip-medium';
      case ENUMS.STORE_RELEASE_VERDICT.LOW_REJECTION_RISK:
        return 'risk-chip-low';
      default:
        return 'risk-chip-pending';
    }
  }

  get isHeaderInProgress() {
    return (
      this.args.item.status === ENUMS.STORE_RELEASE_SCAN_STATUS.IN_PROGRESS
    );
  }

  get headerStatusMeta(): HeaderStatusMeta {
    switch (this.args.item.status) {
      case ENUMS.STORE_RELEASE_SCAN_STATUS.FAILED:
        return {
          label: this.intl.t('failed'),
          iconName: 'cancel',
          iconColor: 'error',
        };

      case ENUMS.STORE_RELEASE_SCAN_STATUS.COMPLETED:
        return {
          label: this.intl.t('completed'),
          iconName: 'check-circle',
          iconColor: 'success',
        };

      case ENUMS.STORE_RELEASE_SCAN_STATUS.PARTIAL:
        return {
          label: this.intl.t('storeReleaseReadiness.partialStatus'),
          iconName: 'hourglass-top',
          iconColor: 'warn',
        };

      case ENUMS.STORE_RELEASE_SCAN_STATUS.IN_PROGRESS:
        return {
          label: this.intl.t('inProgress'),
          iconName: 'check-circle',
          iconColor: 'success',
        };

      case ENUMS.STORE_RELEASE_SCAN_STATUS.NOT_STARTED:
      default:
        return {
          label: this.intl.t('notStarted'),
          iconName: 'do-not-disturb-on',
          iconColor: 'textSecondary',
        };
    }
  }

  get riskChipSvgComponentName() {
    const verdict = ENUMS.STORE_RELEASE_VERDICT;

    switch (this.args.item.verdict) {
      case verdict.HIGH_REJECTION_RISK:
        return 'ak-svg/high-risk-tower';
      case verdict.MODERATE_REJECTION_RISK:
        return 'ak-svg/medium-risk-tower';
      case verdict.LOW_REJECTION_RISK:
        return 'ak-svg/low-risk-tower';
      default:
        return null;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ReleaseCard': typeof StoreReleaseReadinessReleaseCardComponent;
  }
}
