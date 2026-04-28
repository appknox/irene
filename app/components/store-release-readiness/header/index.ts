import Component from '@glimmer/component';
import { action } from '@ember/object';

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
  get selectedPlatform(): PlatformObject {
    return this.args.selectedPlatformValue
      ? (this.platformObjects.find(
          (po) => po.value === Number(this.args.selectedPlatformValue)
        ) ?? {
          key: 'All',
          value: -1,
        })
      : {
          key: 'All',
          value: -1,
        };
  }

  get platformObjects(): PlatformObject[] {
    return [
      {
        key: 'All',
        value: -1,
      },
      {
        key: 'Android',
        value: ENUMS.PLATFORM.ANDROID,
      },
      {
        key: 'iOS',
        value: ENUMS.PLATFORM.IOS,
      },
    ];
  }

  get rejectionRiskObjects(): RejectionRiskObject[] {
    const v = ENUMS.STORE_RELEASE_VERDICT;

    return [
      {
        key: 'All',
        value: -1,
      },
      {
        key: 'High',
        value: v.HIGH_REJECTION_RISK,
      },
      {
        key: 'Medium',
        value: v.MODERATE_REJECTION_RISK,
      },
      {
        key: 'Low',
        value: v.LOW_REJECTION_RISK,
      },
    ];
  }

  get selectedRejectionRisk(): RejectionRiskObject {
    return this.args.selectedRejectionRiskValue
      ? (this.rejectionRiskObjects.find(
          (o) => o.value === Number(this.args.selectedRejectionRiskValue)
        ) ?? {
          key: 'All',
          value: -1,
        })
      : {
          key: 'All',
          value: -1,
        };
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
