import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import ProjectModel from 'irene/models/project';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

type ProjectQueryResponse = DS.AdapterPopulatedRecordArray<ProjectModel> & {
  meta?: { count: number };
};

export const DEFAULT_PROJECT_QUERY_PARAMS = {
  limit: 10,
  offset: 0,
  query: '',
  sortKey: '-last_file_created_on',
  platform: -1,
  team: '',
};

export default class ProjectService extends Service {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked projectQueryResponse: ProjectQueryResponse | null = null;
  @tracked isProjectReponseFiltered = false;

  @action
  setProjectResponseFiltered(
    params: Omit<typeof DEFAULT_PROJECT_QUERY_PARAMS, 'limit'>
  ) {
    this.isProjectReponseFiltered = !Object.entries(params).every(
      ([key, value]) =>
        value === DEFAULT_PROJECT_QUERY_PARAMS[key as keyof typeof params]
    );
  }

  fetchProjects = task(
    { keepLatest: true },
    async (
      limit: number = DEFAULT_PROJECT_QUERY_PARAMS.limit,
      offset: number = DEFAULT_PROJECT_QUERY_PARAMS.offset,
      query: string = DEFAULT_PROJECT_QUERY_PARAMS.query,
      sortKey: string = DEFAULT_PROJECT_QUERY_PARAMS.sortKey,
      platform: number = DEFAULT_PROJECT_QUERY_PARAMS.platform,
      team: string = DEFAULT_PROJECT_QUERY_PARAMS.team
    ) => {
      this.setProjectResponseFiltered({
        offset,
        query,
        sortKey,
        platform,
        team,
      });

      const queryParams = {
        limit,
        offset,
        q: query,
        sorting: sortKey,
        ...(platform !== null && platform !== -1 ? { platform } : {}),
        ...(team ? { team } : {}),
      };

      try {
        this.projectQueryResponse = (await this.store.query(
          'project',
          queryParams
        )) as ProjectQueryResponse;
      } catch (e) {
        const err = e as AdapterError;
        let errMsg = this.intl.t('pleaseTryAgain');

        if (err.errors && err.errors.length) {
          errMsg = err.errors[0]?.detail || errMsg;
        } else if (err.message) {
          errMsg = err.message;
        }

        this.notify.error(errMsg);
      }
    }
  );
}
