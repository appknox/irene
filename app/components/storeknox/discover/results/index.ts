// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type { StoreknoxDiscoveryResultQueryParam } from 'irene/routes/authenticated/storeknox/discover/result';
import type SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';

export type SkDiscoveryResultResponse =
  DS.AdapterPopulatedRecordArray<SkDiscoverySearchResultModel> & {
    meta: { count: number };
  };

export interface StoreknoxDiscoverResultsSignature {
  Args: {
    queryParams: StoreknoxDiscoveryResultQueryParam;
  };
}

interface LimitOffset {
  limit: number;
  offset: number;
}

export default class StoreknoxDiscoverResultsComponent extends Component<StoreknoxDiscoverResultsSignature> {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare intl: IntlService;

  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked searchQuery = '';
  @tracked showDiscoveryResults = false;
  @tracked showDisclaimerModal = false;
  @tracked skDiscoveryResultData: SkDiscoveryResultResponse | null = null;
  @tracked searchId: string | number = '';

  constructor(owner: unknown, args: StoreknoxDiscoverResultsSignature['Args']) {
    super(owner, args);

    const { app_limit, app_offset, app_search_id, app_query } =
      args.queryParams;

    if (app_query) {
      this.fetchDiscoveryResults.perform(
        app_limit,
        app_offset,
        app_search_id,
        app_query
      );

      this.searchQuery = app_query;
    }
  }

  @action
  async discoverApp(event: SubmitEvent) {
    event.preventDefault();

    if (this.searchQuery.length > 1) {
      await this.router.transitionTo(
        'authenticated.storeknox.discover.result',
        {
          queryParams: { app_query: this.searchQuery, app_search_id: null },
        }
      );

      const { app_limit, app_search_id } = this.args.queryParams;

      this.fetchDiscoveryResults.perform(
        app_limit,
        0,
        app_search_id,
        this.searchQuery
      );
    } else {
      this.notify.error(this.intl.t('storeknox.errorSearchCharacter'));
    }
  }

  @action
  clearSearch() {
    this.searchQuery = '';
  }

  @action
  closeDisclaimerModal() {
    this.showDisclaimerModal = false;
  }

  @action
  viewMore() {
    this.showDisclaimerModal = true;
  }

  @action goToPage(args: LimitOffset) {
    const { app_search_id } = this.args.queryParams;

    this.fetchDiscoveryResults.perform(args.limit, args.offset, app_search_id);
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { app_search_id } = this.args.queryParams;

    this.fetchDiscoveryResults.perform(args.limit, 0, app_search_id);
  }

  get isFetchingData() {
    return this.fetchDiscoveryResults.isRunning;
  }

  getSearchIdForQuery = task(async (searchQuery: string) => {
    try {
      const discoveryQuery = this.store.createRecord('skDiscovery', {
        queryStr: searchQuery,
      });

      const uploadedDiscovery = await discoveryQuery.save();

      return uploadedDiscovery.id;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  fetchDiscoveryResults = task(
    { drop: true },
    async (
      limit: number,
      offset: number,
      searchId: string | number,
      searchQuery: string = ''
    ) => {
      this.showDiscoveryResults = true;

      if (searchId) {
        this.searchId = searchId;
      } else {
        this.searchId = await this.getSearchIdForQuery.perform(searchQuery);
      }

      this.setRouteQueryParams(limit, offset, this.searchId);

      try {
        this.skDiscoveryResultData = (await this.store.query(
          'skDiscoveryResult',
          {
            limit,
            offset,
            id: this.searchId,
          }
        )) as SkDiscoveryResultResponse;

        this.removeQueryParamFromStoredUrl();
      } catch (error) {
        this.notify.error(parseError(error));
      }
    }
  );

  removeQueryParamFromStoredUrl() {
    const transInfo = this.window.sessionStorage.getItem('_lastTransitionInfo');

    if (transInfo) {
      const transInfoObj = JSON.parse(transInfo);

      if (transInfoObj.url) {
        transInfoObj.url = transInfoObj.url.split('?')[0];
      }

      this.window.sessionStorage.setItem(
        '_lastTransitionInfo',
        JSON.stringify(transInfoObj)
      );
    }
  }

  setRouteQueryParams(
    limit: number,
    offset: number,
    searchId: string | number
  ) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
        app_search_id: searchId,
      },
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::Results': typeof StoreknoxDiscoverResultsComponent;
  }
}
