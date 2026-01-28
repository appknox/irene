import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';

type SkDiscoverySearchResultModelArray =
  DS.AdapterPopulatedRecordArray<SkDiscoverySearchResultModel>;

type SkDiscoverySearchResultResponse = SkDiscoverySearchResultModelArray & {
  meta: { count: number };
};

type SkSearchQueryData = {
  searchId?: string | number;
  searchQuery?: string;
};

export default class SkDiscoverySearchResultService extends Service {
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked
  skDiscoverySearchResults?: SkDiscoverySearchResultModelArray;

  @tracked limit = 10;
  @tracked offset = 0;
  @tracked searchQuery? = '';
  @tracked searchId?: string | number = '';
  @tracked showDiscoveryResults = false;
  @tracked skDiscoverySearchResultsCount = 0;

  get isFetchingSkDiscoverySearchResults() {
    return (
      this.doFetchDiscoveryResults.isRunning ||
      this.getSearchIdForQuery.isRunning
    );
  }

  setLimitOffset({ limit = 10, offset = 0 }) {
    this.limit = limit;
    this.offset = offset;

    return this;
  }

  setQueryData({ searchQuery, searchId }: SkSearchQueryData) {
    this.searchQuery = searchQuery ?? this.searchQuery;
    this.searchId = searchId ?? this.searchId;

    return this;
  }

  async fetchDiscoveryResults() {
    await this.doFetchDiscoveryResults.perform();
  }

  async fetchSearchIdForQuery(searchQuery = '') {
    await this.getSearchIdForQuery.perform(searchQuery);
  }

  getSearchIdForQuery = task(async (searchQuery = '') => {
    try {
      const discoveryQuery = this.store.createRecord('sk-discovery', {
        queryStr: searchQuery,
      });

      const uploadedDiscovery = await discoveryQuery.save();
      const searchId = uploadedDiscovery.id;

      this.searchId = searchId;

      this.router.transitionTo({
        queryParams: { app_search_id: this.searchId },
      });
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  doFetchDiscoveryResults = task(async () => {
    this.showDiscoveryResults = true;

    try {
      const discoveryResultData = (await this.store.query(
        'sk-discovery-result',
        {
          limit: this.limit,
          offset: this.offset,
          id: this.searchId,
        }
      )) as SkDiscoverySearchResultResponse;

      this.skDiscoverySearchResults = discoveryResultData;
      this.skDiscoverySearchResultsCount = discoveryResultData.meta.count;

      this.removeQueryParamFromStoredUrl();
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

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
}
