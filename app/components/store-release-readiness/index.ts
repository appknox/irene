import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { debounceTask } from 'ember-lifeline';

import type { StoreReleaseReadinessIndexQueryParam } from 'irene/routes/authenticated/dashboard/store-release-readiness/index';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type {
  PlatformObject,
  RejectionRiskObject,
} from 'irene/components/store-release-readiness/header';
import type StoreReleaseReadinessListService from 'irene/services/store-release-readiness-list';

export interface StoreReleaseReadinessSignature {
  Args: {
    queryParams: StoreReleaseReadinessIndexQueryParam;
  };
}

export default class StoreReleaseReadinessComponent extends Component<StoreReleaseReadinessSignature> {
  @service('store-release-readiness-list')
  declare storeReleaseReadinessList: StoreReleaseReadinessListService;

  constructor(owner: unknown, args: StoreReleaseReadinessSignature['Args']) {
    super(owner, args);

    const {
      app_limit,
      app_offset,
      app_query,
      app_platform,
      app_rejection_risk,
    } = args.queryParams;

    this.storeReleaseReadinessList.fetchStoreReleaseReadinessScans.perform(
      app_limit,
      app_offset,
      app_query,
      app_platform,
      app_rejection_risk,
      false
    );
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get isLoading() {
    return this.storeReleaseReadinessList.fetchStoreReleaseReadinessScans
      .isRunning;
  }

  get hasActiveSearchOrFilters() {
    return this.storeReleaseReadinessList.isScanListResponseFiltered;
  }

  get hasNoStoreReleaseReadinessScan() {
    return (
      this.totalStoreReleaseReadinessScanCount === 0 &&
      !this.isLoading &&
      !this.hasActiveSearchOrFilters
    );
  }

  get hasNoFilterResults() {
    return (
      this.totalStoreReleaseReadinessScanCount === 0 &&
      !this.isLoading &&
      this.hasActiveSearchOrFilters
    );
  }

  get showPagination() {
    return this.totalStoreReleaseReadinessScanCount > 0;
  }

  get totalStoreReleaseReadinessScanCount() {
    return this.storeReleaseReadinessList.scanQueryResponse?.meta?.count || 0;
  }

  get storeReleaseReadinessScanList() {
    return this.storeReleaseReadinessList.scanQueryResponse?.slice() || [];
  }

  get resultDependencies() {
    const { app_query, app_platform, app_rejection_risk } =
      this.args.queryParams;

    return [
      this.limit,
      this.offset,
      app_query,
      app_platform,
      app_rejection_risk,
    ];
  }

  @action handleResultDependenciesChange() {
    const { app_query, app_platform, app_rejection_risk } =
      this.args.queryParams;

    this.storeReleaseReadinessList.fetchStoreReleaseReadinessScans.perform(
      this.limit,
      this.offset,
      app_query,
      app_platform,
      app_rejection_risk,
      false
    );
  }

  @action handlePrevNextAction({
    limit,
    offset,
  }: PaginationProviderActionsArgs) {
    const { app_query, app_platform, app_rejection_risk } =
      this.args.queryParams;

    this.storeReleaseReadinessList.fetchStoreReleaseReadinessScans.perform(
      limit,
      offset,
      app_query,
      app_platform,
      app_rejection_risk
    );
  }

  @action handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    const { app_query, app_platform, app_rejection_risk } =
      this.args.queryParams;

    this.storeReleaseReadinessList.fetchStoreReleaseReadinessScans.perform(
      limit,
      0,
      app_query,
      app_platform,
      app_rejection_risk
    );
  }

  @action searchStoreReleaseReadinessForQuery(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    debounceTask(this, 'setSearchQuery', query, 500);
  }

  setSearchQuery(query: string) {
    const { app_platform, app_rejection_risk } = this.args.queryParams;

    this.storeReleaseReadinessList.fetchStoreReleaseReadinessScans.perform(
      this.limit,
      0,
      query,
      app_platform,
      app_rejection_risk
    );
  }

  @action handleSearchClear() {
    const { app_platform, app_rejection_risk } = this.args.queryParams;

    this.storeReleaseReadinessList.fetchStoreReleaseReadinessScans.perform(
      this.limit,
      0,
      '',
      app_platform,
      app_rejection_risk
    );
  }

  @action filterPlatform(platform: PlatformObject) {
    const { app_limit, app_query, app_rejection_risk } = this.args.queryParams;

    this.storeReleaseReadinessList.fetchStoreReleaseReadinessScans.perform(
      app_limit,
      0,
      app_query,
      platform.value.toString(),
      app_rejection_risk
    );
  }

  @action filterRejectionRisk(risk: RejectionRiskObject) {
    const { app_limit, app_query, app_platform } = this.args.queryParams;

    this.storeReleaseReadinessList.fetchStoreReleaseReadinessScans.perform(
      app_limit,
      0,
      app_query,
      app_platform,
      risk.value.toString()
    );
  }

  @action handleClearFilters() {
    const { app_limit, app_query } = this.args.queryParams;

    this.storeReleaseReadinessList.fetchStoreReleaseReadinessScans.perform(
      app_limit,
      0,
      app_query,
      '-1',
      '-1'
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    StoreReleaseReadiness: typeof StoreReleaseReadinessComponent;
  }
}
