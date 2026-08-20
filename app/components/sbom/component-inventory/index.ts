import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounceTask } from 'ember-lifeline';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';

import parseError from 'irene/utils/parse-error';
import type { SbomComponentInventoryQueryParam } from 'irene/routes/authenticated/dashboard/sbom/component-inventory';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type SbomComponentInventoryModel from 'irene/models/sbom-component-inventory';

const MIN_SEARCH_LENGTH = 3;

type SbomComponentInventoryQueryResponse =
  DS.AdapterPopulatedRecordArray<SbomComponentInventoryModel> & {
    meta: { count: number };
  };

export interface SbomComponentInventorySignature {
  Args: {
    queryParams: SbomComponentInventoryQueryParam;
  };
}

export default class SbomComponentInventoryComponent extends Component<SbomComponentInventorySignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked
  queryResponse: SbomComponentInventoryQueryResponse | null = null;

  @tracked selectedComponent: SbomComponentInventoryModel | null = null;
  @tracked searchQuery: string;

  tPleaseTryAgain: string;

  constructor(owner: unknown, args: SbomComponentInventorySignature['Args']) {
    super(owner, args);

    this.searchQuery = this.args.queryParams.component_query || '';
    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    if (this.hasValidQuery) {
      this.fetchComponents.perform(
        this.limit,
        this.offset,
        this.searchQuery,
        this.componentType,
        false
      );
    }
  }

  get limit() {
    return Number(this.args.queryParams.component_limit);
  }

  get offset() {
    return Number(this.args.queryParams.component_offset);
  }

  get componentType() {
    return this.args.queryParams.component_type;
  }

  get trimmedQuery() {
    return (this.searchQuery || '').trim();
  }

  get hasValidQuery() {
    return this.trimmedQuery.length >= MIN_SEARCH_LENGTH;
  }

  get showMinLengthHint() {
    const length = this.trimmedQuery.length;

    return length > 0 && length < MIN_SEARCH_LENGTH;
  }

  get componentList() {
    return this.queryResponse?.slice() || [];
  }

  get totalComponentCount() {
    return this.queryResponse?.meta?.count || 0;
  }

  get hasNoComponent() {
    return this.totalComponentCount === 0;
  }

  get isDrawerOpen() {
    return Boolean(this.selectedComponent);
  }

  get columns() {
    return [
      {
        name: this.intl.t('sbomModule.componentName'),
        valuePath: 'displayName',
        width: 300,
      },
      {
        name: this.intl.t('sbomModule.componentType'),
        valuePath: 'typeLabel',
      },
      {
        name: this.intl.t('sbomModule.componentVersion'),
        valuePath: 'displayVersion',
      },
      {
        name: this.intl.t('status'),
        component: 'sbom/component-status',
      },
    ];
  }

  @action
  handleComponentRowClick({
    rowValue,
  }: {
    rowValue: SbomComponentInventoryModel;
  }) {
    this.selectedComponent = rowValue;
  }

  @action
  handleDrawerClose() {
    this.selectedComponent = null;
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.fetchComponents.perform(
      limit,
      offset,
      this.searchQuery,
      this.componentType
    );
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.fetchComponents.perform(
      limit,
      0,
      this.searchQuery,
      this.componentType
    );
  }

  @action
  handleComponentTypeChange(componentType: string) {
    this.fetchComponents.perform(
      this.limit,
      0,
      this.searchQuery,
      componentType
    );
  }

  @action
  handleSearchQueryChange(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    this.searchQuery = query;

    debounceTask(this, 'setSearchQuery', query, 500);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.fetchComponents.perform(this.limit, 0, query, this.componentType);
  }

  @action
  handleClear() {
    this.searchQuery = '';

    this.fetchComponents.perform(this.limit, 0, '', this.componentType);
  }

  setRouteQueryParams(
    limit: string | number,
    offset: string | number,
    query: string,
    componentType: string
  ) {
    this.router.transitionTo({
      queryParams: {
        component_limit: limit,
        component_offset: offset,
        component_query: query || null,
        component_type: componentType || null,
      },
    });
  }

  fetchComponents = task(
    { drop: true },
    async (
      limit: string | number,
      offset: string | number,
      query: string,
      componentType: string,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset, query, componentType);
      }

      // Require a minimum query length before hitting the backend, otherwise
      // show the search prompt instead of listing everything.
      if (!query || query.trim().length < MIN_SEARCH_LENGTH) {
        this.queryResponse = null;

        return;
      }

      try {
        this.queryResponse = (await this.store.query(
          'sbom-component-inventory',
          {
            limit,
            offset,
            q: query,
            ...(componentType ? { component_type: componentType } : {}),
          }
        )) as SbomComponentInventoryQueryResponse;
      } catch (e) {
        this.notify.error(parseError(e, this.tPleaseTryAgain));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInventory': typeof SbomComponentInventoryComponent;
  }
}
