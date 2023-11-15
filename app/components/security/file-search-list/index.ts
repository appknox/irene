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

import SecurityFileModel from 'irene/models/security/file';
import parseError from 'irene/utils/parse-error';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import RealtimeService from 'irene/services/realtime';

export interface SecurityFileSearchListSignature {
  Element: HTMLElement;
  Args: {
    projectId: string;
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

  @tracked securityFilesQuery: SecurityFilesQueryResponse | null = null;
  @tracked limit = 10;
  @tracked offset = 0;
  sortProperties = ['-id'];

  constructor(owner: unknown, args: SecurityFileSearchListSignature['Args']) {
    super(owner, args);

    this.fetchSecurityFiles.perform(this.limit, this.offset);
    addObserver(this.realtime, 'FileCounter', this, this.observeFileCounter);
  }

  get sortedSecurityFiles() {
    return this.securityFilesQuery?.sortBy(...this.sortProperties).toArray();
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

  @action
  handlePrevNextAction({ limit, offset }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = offset;

    this.fetchSecurityFiles.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = 0;

    this.fetchSecurityFiles.perform(limit, 0);
  }

  fetchSecurityFiles = task(async (limit: number, offset: number) => {
    try {
      this.securityFilesQuery = (await this.store.query('security/file', {
        projectId: this.args.projectId,
        limit,
        offset,
      })) as SecurityFilesQueryResponse;
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });

  observeFileCounter() {
    this.fetchSecurityFiles.perform(this.limit, 0);
  }

  removeFileCounterObserver() {
    removeObserver(this.realtime, 'FileCounter', this, this.observeFileCounter);
  }

  willDestroy() {
    super.willDestroy();
    this.removeFileCounterObserver();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::FileSearchList': typeof SecurityFileSearchListComponent;
  }
}
