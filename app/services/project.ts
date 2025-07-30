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
  limit: 12,
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

  @tracked appliedFilters = DEFAULT_PROJECT_QUERY_PARAMS;

  get isProjectReponseFiltered() {
    return !Object.entries(this.appliedFilters).every(
      ([key, value]) =>
        value ===
        DEFAULT_PROJECT_QUERY_PARAMS[key as keyof typeof this.appliedFilters]
    );
  }

  @action
  setQueryParams(params: typeof DEFAULT_PROJECT_QUERY_PARAMS) {
    this.appliedFilters = params;

    return this;
  }

  fetchProjects = task({ keepLatest: true }, async () => {
    const { limit, offset, query, sortKey, platform, team } =
      this.appliedFilters;

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
  });
}
