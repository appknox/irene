/* eslint-disable ember/no-observers */
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import IntlService from 'ember-intl/services/intl';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { debounceTask } from 'ember-lifeline';

import parseError from 'irene/utils/parse-error';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import RealtimeService from 'irene/services/realtime';
import SecurityProjectModel from 'irene/models/security/project';
import { SecurityProjectsQueryParam } from 'irene/routes/authenticated/security/projects';

export interface SecurityProjectSearchListSignature {
  Element: HTMLElement;
  Args: {
    queryParams: SecurityProjectsQueryParam;
  };
}

type SecurityProjectQueryResponse =
  DS.AdapterPopulatedRecordArray<SecurityProjectModel> & {
    meta?: { count: number };
  };

export default class SecurityProjectSearchListComponent extends Component<SecurityProjectSearchListSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service('intl') declare intl: IntlService;
  @service('realtime') declare realtime: RealtimeService;
  @service declare router: RouterService;

  @tracked securityProjectsQuery: SecurityProjectQueryResponse | null = null;

  sortProperties = ['-id'];

  constructor(
    owner: unknown,
    args: SecurityProjectSearchListSignature['Args']
  ) {
    super(owner, args);

    const { app_limit, app_offset, app_query } = args.queryParams;

    this.fetchSecurityProjects.perform(app_limit, app_offset, app_query, false);
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get sortedSecurityProjects() {
    return this.securityProjectsQuery?.slice()?.sortBy(...this.sortProperties);
  }

  get totalProjects() {
    return this.securityProjectsQuery?.meta?.count || 0;
  }

  get hasNoSecurityProjects() {
    return this.totalProjects < 1;
  }

  get columns() {
    return [
      {
        name: 'Project ID',
        valuePath: 'id',
      },
      {
        name: 'Project Name',
        valuePath: 'packageName',
      },
      {
        name: 'View All Files',
        component: 'security/project-search-list/view-all-files',
        textAlign: 'center',
      },
    ];
  }

  @action
  searchProjectsQuery(event: Event): void {
    const query = (event.target as HTMLInputElement).value;

    debounceTask(this, 'searchProjects', query, 500);
  }

  @action
  clearSearchInput() {
    this.fetchSecurityProjects.perform(this.limit, 0, '');
  }

  @action searchProjects(query: string) {
    this.fetchSecurityProjects.perform(this.limit, 0, query);
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    const { app_query } = this.args.queryParams;

    this.fetchSecurityProjects.perform(limit, offset, app_query);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    const { app_query } = this.args.queryParams;

    this.fetchSecurityProjects.perform(limit, 0, app_query);
  }

  fetchSecurityProjects = task(
    { drop: true },
    async (
      limit: string | number,
      offset: string | number,
      query: string,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset, query);
      }

      try {
        this.securityProjectsQuery = (await this.store.query(
          'security/project',
          {
            limit,
            offset,
            q: query,
          }
        )) as SecurityProjectQueryResponse;
      } catch (e) {
        this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
      }
    }
  );

  setRouteQueryParams(
    limit: string | number,
    offset: string | number,
    query: string
  ) {
    const searchQueryParam = query || null;

    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
        app_query: searchQueryParam,
      },
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::ProjectSearchList': typeof SecurityProjectSearchListComponent;
  }
}
