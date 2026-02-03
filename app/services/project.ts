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
  scanType: -1,
};

export default class ProjectService extends Service {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked projectQueryResponse: ProjectQueryResponse | null = null;
  @tracked isProjectReponseFiltered = false;
  @tracked viewType: 'card' | 'list' = 'card';
  @tracked overallProjectCount: number = 0;

  constructor(properties?: object) {
    super(properties);

    const savedViewType = localStorage.getItem('projectViewType') as
      | 'card'
      | 'list';

    if (savedViewType) {
      this.viewType = savedViewType;
    }
  }

  @action
  setProjectResponseFiltered(
    params: Omit<typeof DEFAULT_PROJECT_QUERY_PARAMS, 'limit'>
  ) {
    this.isProjectReponseFiltered = !Object.entries(params).every(
      ([key, value]) =>
        value === DEFAULT_PROJECT_QUERY_PARAMS[key as keyof typeof params]
    );
  }

  @action
  setViewType(viewType: 'card' | 'list') {
    this.viewType = viewType;
    localStorage.setItem('projectViewType', viewType);
  }

  fetchProjects = task(
    { keepLatest: true },
    async (
      limit: number = DEFAULT_PROJECT_QUERY_PARAMS.limit,
      offset: number = DEFAULT_PROJECT_QUERY_PARAMS.offset,
      query: string = DEFAULT_PROJECT_QUERY_PARAMS.query,
      sortKey: string = DEFAULT_PROJECT_QUERY_PARAMS.sortKey,
      platform: number = DEFAULT_PROJECT_QUERY_PARAMS.platform,
      team: string = DEFAULT_PROJECT_QUERY_PARAMS.team,
      scanType: number = DEFAULT_PROJECT_QUERY_PARAMS.scanType
    ) => {
      this.setProjectResponseFiltered({
        offset,
        query,
        sortKey,
        platform,
        team,
        scanType,
      });

      const isDefaultFilters =
        query === DEFAULT_PROJECT_QUERY_PARAMS.query &&
        team === DEFAULT_PROJECT_QUERY_PARAMS.team &&
        platform === DEFAULT_PROJECT_QUERY_PARAMS.platform &&
        scanType === DEFAULT_PROJECT_QUERY_PARAMS.scanType;

      const queryParams = {
        limit,
        offset,
        q: query,
        sorting: sortKey,
        ...(platform !== null && platform !== -1 ? { platform } : {}),
        ...(team ? { team } : {}),
        ...(scanType !== null && scanType !== -1
          ? { scan_type: scanType }
          : {}),
      };

      try {
        this.projectQueryResponse = (await this.store.query(
          'project',
          queryParams
        )) as ProjectQueryResponse;

        if (isDefaultFilters) {
          this.overallProjectCount =
            this.projectQueryResponse?.meta?.count || 0;
        }
      } catch (e) {
        const err = e as AdapterError;

        let isRateLimitError = false;
        let errMsg = this.intl.t('pleaseTryAgain');

        const firstError = err?.errors?.[0];

        if (firstError) {
          isRateLimitError = Number(firstError.status) === 429;

          if (firstError.detail) {
            errMsg = firstError.detail;
          }
        }

        // Only show toast for non–rate-limit errors
        if (!isRateLimitError) {
          this.notify.error(errMsg);
        }
      }
    }
  );
}
