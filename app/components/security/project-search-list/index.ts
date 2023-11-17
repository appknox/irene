/* eslint-disable ember/no-observers */
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import IntlService from 'ember-intl/services/intl';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { addObserver, removeObserver } from '@ember/object/observers';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import { action } from '@ember/object';

import parseError from 'irene/utils/parse-error';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import RealtimeService from 'irene/services/realtime';
import SecurityProjectModel from 'irene/models/security/project';
import { debounce } from '@ember/runloop';

export interface SecurityProjectSearchListSignature {
  Element: HTMLElement;
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

  @tracked securityProjectsQuery: SecurityProjectQueryResponse | null = null;
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked query = '';

  sortProperties = ['-id'];

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchSecurityProjects.perform(this.limit, this.offset);

    addObserver(
      this.realtime,
      'ProjectCounter',
      this,
      this.observeProjectCounter
    );
  }

  get sortedSecurityProjects() {
    return this.securityProjectsQuery?.sortBy(...this.sortProperties).toArray();
  }

  get totalProjects() {
    return this.securityProjectsQuery?.meta?.count || 0;
  }

  get hasNoSecurityProjects() {
    return this.totalProjects < 1;
  }

  @action
  searchProjectsQuery(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
    debounce(this, this.searchProjects, 500);
  }

  @action searchProjects() {
    this.fetchSecurityProjects.perform(this.limit, 0);
  }

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = offset;

    this.fetchSecurityProjects.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = 0;

    this.fetchSecurityProjects.perform(limit, 0);
  }

  fetchSecurityProjects = task(async (limit: number, offset: number) => {
    try {
      this.securityProjectsQuery = (await this.store.query('security/project', {
        limit,
        offset,
        q: this.query,
      })) as SecurityProjectQueryResponse;
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });

  observeProjectCounter() {
    this.fetchSecurityProjects.perform(this.limit, 0);
  }

  removeProjectCounterObserver() {
    removeObserver(
      this.realtime,
      'ProjectCounter',
      this,
      this.observeProjectCounter
    );
  }

  willDestroy() {
    super.willDestroy();
    this.removeProjectCounterObserver();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::ProjectSearchList': typeof SecurityProjectSearchListComponent;
  }
}
