import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import RouterService from '@ember/routing/router-service';

import SkAppModel from 'irene/models/sk-app';
import { action } from '@ember/object';

type SkRequestedAppResponse = DS.AdapterPopulatedRecordArray<SkAppModel> & {
  meta: { count: number };
};

export const DEFAULT_PROJECT_QUERY_PARAMS = {
  query: '',
  platform: -1,
};

export default class SkRequestedAppService extends Service {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare router: RouterService;

  @tracked skRequestedAppData: SkRequestedAppResponse | null = null;

  get isFetchingData() {
    return this.fetchRequestedApps.isRunning;
  }

  fetchRequestedApps = task(
    { drop: true },
    async (
      limit: string | number,
      offset: string | number,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      try {
        // this.skRequestedAppData = (await waitForPromise(
        //   this.requestedApps(Number(limit), Number(offset))
        // )) as SkRequestedAppResponse;

        this.skRequestedAppData = (await this.store.query('skApp', {
          limit,
          offset,
          approval_status: 1,
        })) as SkRequestedAppResponse;
      } catch (e) {
        console.log(e);
      }
    }
  );

  setRouteQueryParams(limit: string | number, offset: string | number) {
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }

  @action
  async requestedApps(limit: number, offset: number) {
    const adapter = this.store.adapterFor('sk-app');

    return await adapter.requestedApps(limit, offset);
  }

  get totalCount() {
    return this.skRequestedAppData?.meta?.count || 0;
  }
}
