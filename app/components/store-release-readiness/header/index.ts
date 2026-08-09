import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import styles from './index.scss';

export interface PlatformObject {
  key: string;
  value: number;
}

export interface RejectionRiskObject {
  key: string;
  value: number;
}

export interface StoreReleaseReadinessHeaderSignature {
  Args: {
    packageNameSearchQuery: string;
    onQueryChange(event: Event): void;
    handleClear(): void;
    selectedPlatformValue: string;
    selectedRejectionRiskValue: string;
    filterPlatform(platform: PlatformObject): void;
    filterRejectionRisk(risk: RejectionRiskObject): void;
    handleClearFilters(): void;
  };
}

export default class StoreReleaseReadinessHeaderComponent extends Component<StoreReleaseReadinessHeaderSignature> {
  @service declare intl: IntlService;

  get platformObjects(): PlatformObject[] {
    return [
      {
        key: this.intl.t('all'),
        value: -1,
      },
      {
        key: this.intl.t('android'),
        value: ENUMS.PLATFORM.ANDROID,
      },
      {
        key: this.intl.t('ios'),
        value: ENUMS.PLATFORM.IOS,
      },
    ];
  }

  get selectedPlatform(): PlatformObject {
    const num = this.args.selectedPlatformValue
      ? Number(this.args.selectedPlatformValue)
      : -1;

    return (
      this.platformObjects.find((po) => po.value === num) ?? {
        key: this.intl.t('all'),
        value: -1,
      }
    );
  }

  get rejectionRiskObjects(): RejectionRiskObject[] {
    const verdict = ENUMS.STORE_RELEASE_VERDICT;

    return [
      {
        key: this.intl.t('all'),
        value: -1,
      },
      {
        key: this.intl.t('high'),
        value: verdict.HIGH_REJECTION_RISK,
      },
      {
        key: this.intl.t('medium'),
        value: verdict.MODERATE_REJECTION_RISK,
      },
      {
        key: this.intl.t('low'),
        value: verdict.LOW_REJECTION_RISK,
      },
    ];
  }

  get selectedRejectionRisk(): RejectionRiskObject {
    const num = this.args.selectedRejectionRiskValue
      ? Number(this.args.selectedRejectionRiskValue)
      : -1;

    return (
      this.rejectionRiskObjects.find((o) => o.value === num) ?? {
        key: this.intl.t('all'),
        value: -1,
      }
    );
  }

  get dropDownClass() {
    return styles['filter-input-dropdown'];
  }

  get triggerClass() {
    return styles['filter-input'];
  }

  get clearFilterIconClass() {
    return styles['clear-filter-icon'];
  }

  get showClearFilter() {
    const platformActive =
      this.args.selectedPlatformValue &&
      Number(this.args.selectedPlatformValue) !== -1;

    const rejectionRiskActive =
      this.args.selectedRejectionRiskValue &&
      Number(this.args.selectedRejectionRiskValue) !== -1;

    return platformActive || rejectionRiskActive;
  }

  @action filterPlatformChange(platform: PlatformObject) {
    this.args.filterPlatform(platform);
  }

  @action filterRejectionRiskChange(risk: RejectionRiskObject) {
    this.args.filterRejectionRisk(risk);
  }

  @action clearSearchInput() {
    this.args.handleClear();
  }

  @action onSearchQueryChange(event: Event) {
    this.args.onQueryChange(event);
  }

  @action clearFilters() {
    this.args.handleClearFilters();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::Header': typeof StoreReleaseReadinessHeaderComponent;
  }
}
