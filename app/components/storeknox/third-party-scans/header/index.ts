import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { debounceTask } from 'ember-lifeline';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENUMS from 'irene/enums';
import styles from './index.scss';

interface StoreOption {
  label: string;
  value: string;
}

interface RiskStatusOption {
  label: string;
  value: number;
}

interface RegionOption {
  label: string;
  value: string;
}

interface Signature {
  Args: {
    selectedStore: string;
    selectedRegion: string;
    selectedRiskStatus: number;
    filterQuery: string;
    regionsOpted: string[] | null | undefined;
  };
}

export default class StoreknoxThirdPartyScansHeaderComponent extends Component<Signature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @tracked filterQuery = this.args.filterQuery ?? '';

  get regionOptions(): RegionOption[] {
    const regions = this.args.regionsOpted ?? [];

    return regions.map((r) => ({ label: r, value: r }));
  }

  get showRegionFilter() {
    return this.regionOptions.length > 1;
  }

  get singleRegion() {
    return this.regionOptions.length === 1 ? this.regionOptions[0]?.label : '';
  }

  get selectedRegionOption() {
    return (
      this.regionOptions.find((o) => o.value === this.args.selectedRegion) ??
      this.regionOptions[0]
    );
  }

  get regionDropdownClass() {
    return styles['filter-dropdown-region'];
  }

  get storeOptions(): StoreOption[] {
    return [
      { label: this.intl.t('storeknox.appStore'), value: 'appstore' },
      { label: this.intl.t('storeknox.playStore'), value: 'playstore' },
    ];
  }

  get riskStatusOptions(): RiskStatusOption[] {
    const RS = ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS;

    return [
      { label: this.intl.t('all'), value: -1 },
      { label: this.intl.t('storeknox.riskStatus.minimal'), value: RS.MINIMAL },
      { label: this.intl.t('storeknox.riskStatus.medium'), value: RS.MEDIUM },
      { label: this.intl.t('storeknox.riskStatus.high'), value: RS.HIGH },
    ];
  }

  get searchFieldClass() {
    return styles['search-field'];
  }

  get triggerClass() {
    return styles['filter-trigger'];
  }

  get storeDropdownClass() {
    return styles['filter-dropdown-store'];
  }

  get riskStatusDropdownClass() {
    return styles['filter-dropdown-risk-status'];
  }

  get selectedStoreOption() {
    return (
      this.storeOptions.find((o) => o.value === this.args.selectedStore) ??
      this.storeOptions[0]
    );
  }

  get selectedRiskStatusOption() {
    return (
      this.riskStatusOptions.find(
        (o) => o.value === this.args.selectedRiskStatus
      ) ?? this.riskStatusOptions[0]
    );
  }

  @action onStoreChange(option: StoreOption) {
    this.router.transitionTo({
      queryParams: { tp_store: option.value, tp_offset: 0 },
    });
  }

  @action onRegionChange(option: RegionOption) {
    this.router.transitionTo({
      queryParams: { tp_region: option.value, tp_offset: 0 },
    });
  }

  @action onRiskStatusChange(option: RiskStatusOption) {
    this.router.transitionTo({
      queryParams: { tp_risk_status: option.value, tp_offset: 0 },
    });
  }

  commitSearch(query: string) {
    this.router.transitionTo({
      queryParams: { tp_filter: query, tp_offset: 0 },
    });
  }

  @action onSearchInput(event: Event) {
    this.filterQuery = (event.target as HTMLInputElement).value;
    debounceTask(this, 'commitSearch', this.filterQuery, 500);
  }

  @action onSearchClear() {
    this.filterQuery = '';
    this.router.transitionTo({ queryParams: { tp_filter: '', tp_offset: 0 } });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ThirdPartyScans::Header': typeof StoreknoxThirdPartyScansHeaderComponent;
  }
}
