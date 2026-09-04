import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { debounceTask } from 'ember-lifeline';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENUMS from 'irene/enums';
import type { SkThirdPartyAppStoreFilter } from 'irene/services/sk-third-party-apps';

import styles from './index.scss';

interface StoreOption {
  label: string;
  value: SkThirdPartyAppStoreFilter;
}

interface RiskStatusOption {
  label: string;
  value: number;
}

interface RegionOption {
  label: string;
  value: string;
}

interface StoreknoxThirdPartyScansHeaderSignature {
  Args: {
    selectedStore: string;
    selectedRegion: string;
    selectedRiskStatus: number;
    filterQuery: string;
    playstoreRegionsOpted: string[] | null | undefined;
    appstoreRegionsOpted: string[] | null | undefined;
  };
}

export default class StoreknoxThirdPartyScansHeaderComponent extends Component<StoreknoxThirdPartyScansHeaderSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @tracked filterQuery = '';

  constructor(
    owner: unknown,
    args: StoreknoxThirdPartyScansHeaderSignature['Args']
  ) {
    super(owner, args);

    this.filterQuery = this.args.filterQuery ?? '';
  }

  get regionsOptedForSelectedStore(): string[] {
    return this.args.selectedStore === 'playstore'
      ? (this.args.playstoreRegionsOpted ?? [])
      : (this.args.appstoreRegionsOpted ?? []);
  }

  get regionOptions(): RegionOption[] {
    return this.regionsOptedForSelectedStore.map((r) => ({
      label: this.regionLabel(r),
      value: r,
    }));
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

  get showStoreFilter() {
    // Only offer the store filter when both stores actually have data
    return (
      (this.args.appstoreRegionsOpted ?? []).length > 0 &&
      (this.args.playstoreRegionsOpted ?? []).length > 0
    );
  }

  get storeOptions(): StoreOption[] {
    const options: StoreOption[] = [];

    if ((this.args.appstoreRegionsOpted ?? []).length > 0) {
      options.push({
        label: this.intl.t('storeknox.appStore'),
        value: 'appstore',
      });
    }

    if ((this.args.playstoreRegionsOpted ?? []).length > 0) {
      options.push({
        label: this.intl.t('storeknox.playStore'),
        value: 'playstore',
      });
    }

    return options;
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

  regionLabel(code: string) {
    const key = `storeknox.regionNames.${code}`;

    return this.intl.exists(key) ? this.intl.t(key) : code;
  }

  @action onStoreChange(option: StoreOption) {
    // Each store has its own region list - clear tp_region so the route
    // picks the new store's first opted region instead of carrying over a
    // region that may not even apply to it.
    this.router.transitionTo({
      queryParams: { tp_store: option.value, tp_region: '', tp_offset: 0 },
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
