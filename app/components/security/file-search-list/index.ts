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

import SecurityFileModel from 'irene/models/security/file';
import parseError from 'irene/utils/parse-error';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import RealtimeService from 'irene/services/realtime';
import { SecurityFilesQueryParam } from 'irene/routes/authenticated/security/files';

export interface SecurityFileSearchListSignature {
  Element: HTMLElement;
  Args: {
    projectId: string;
    queryParams: SecurityFilesQueryParam;
  };
}

type SecurityFilesQueryResponse =
  DS.AdapterPopulatedRecordArray<SecurityFileModel> & {
    meta?: { count: number };
  };

export default class SecurityFileSearchListComponent extends Component<SecurityFileSearchListSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service('intl') declare intl: IntlService;
  @service('realtime') declare realtime: RealtimeService;
  @service declare router: RouterService;

  @tracked securityFilesQuery: SecurityFilesQueryResponse | null = null;
  sortProperties = ['-id'];

  constructor(owner: unknown, args: SecurityFileSearchListSignature['Args']) {
    super(owner, args);

    const { app_limit, app_offset } = args.queryParams;

    this.fetchSecurityFiles.perform(app_limit, app_offset, false);
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get sortedSecurityFiles() {
    return this.securityFilesQuery?.slice()?.sortBy(...this.sortProperties);
  }

  get totalFiles() {
    return this.securityFilesQuery?.meta?.count || 0;
  }

  get hasNoSecurityFiles() {
    return this.totalFiles < 1;
  }

  get hidePagination() {
    return this.totalFiles <= this.limit;
  }

  get columns() {
    return [
      {
        name: 'File ID',
        valuePath: 'id',
      },
      {
        name: 'File Name',
        valuePath: 'name',
      },
      {
        name: 'View',
        component: 'security/file-search-list/view',
        textAlign: 'center',
      },
      {
        name: 'Download',
        component: 'security/file-search-list/download',
        textAlign: 'center',
      },
    ];
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.fetchSecurityFiles.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.fetchSecurityFiles.perform(limit, 0);
  }

  fetchSecurityFiles = task(
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
        this.securityFilesQuery = (await this.store.query('security/file', {
          projectId: this.args.projectId,
          limit,
          offset,
        })) as SecurityFilesQueryResponse;
      } catch (e) {
        this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::FileSearchList': typeof SecurityFileSearchListComponent;
  }
}
