/* eslint-disable ember/use-ember-data-rfc-395-imports */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type { DS } from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type ProjectOverdueVulnerabilityModel from 'irene/models/project-overdue-vulnerability';
import type { FileOverdueVulnerabilitiesQueryParams } from 'irene/routes/authenticated/dashboard/file/overdue-vulnerabilities';

type OverdueVulnerabilitiesResponse =
  DS.AdapterPopulatedRecordArray<ProjectOverdueVulnerabilityModel> & {
    meta: { count: number };
  };

export interface OverdueVulnerabilitiesSignature {
  Args: {
    file: FileModel;
    queryParams: Partial<FileOverdueVulnerabilitiesQueryParams>;
  };
}

export const DEFAULT_OVERDUE_VULNERABILITIES_ORDERING = '-severity';

export default class OverdueVulnerabilitiesComponent extends Component<OverdueVulnerabilitiesSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked response: OverdueVulnerabilitiesResponse | null = null;
  @tracked limit: number;
  @tracked offset: number;
  @tracked ordering: string;
  @tracked showSlaPolicy = false;

  constructor(owner: unknown, args: OverdueVulnerabilitiesSignature['Args']) {
    super(owner, args);

    this.limit = Number(args.queryParams.limit ?? 10);
    this.offset = Number(args.queryParams.offset ?? 0);
    this.ordering =
      args.queryParams.ordering ?? DEFAULT_OVERDUE_VULNERABILITIES_ORDERING;

    this.fetchOverdueVulnerabilities.perform();
  }

  get overdueVulnerabilities() {
    return this.response?.slice() ?? [];
  }

  get totalCount() {
    return this.response?.meta?.count ?? 0;
  }

  get hasNoOverdueVulnerabilities() {
    return this.totalCount === 0;
  }

  setRouteQueryParams() {
    this.router.transitionTo({
      queryParams: {
        limit: this.limit,
        offset: this.offset,
        ordering: this.ordering,
      },
    });
  }

  @action
  handlePageChange({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;
    this.reload();
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;
    this.reload();
  }

  @action
  handleOrderingChange(ordering: string) {
    this.ordering = ordering;
    this.offset = 0;
    this.reload();
  }

  @action
  openSlaPolicy() {
    this.showSlaPolicy = true;
  }

  @action
  closeSlaPolicy() {
    this.showSlaPolicy = false;
  }

  reload() {
    this.setRouteQueryParams();
    this.fetchOverdueVulnerabilities.perform();
  }

  fetchOverdueVulnerabilities = task({ restartable: true }, async () => {
    try {
      const project = await this.args.file.project;

      this.response = (await this.store.query('project-overdue-vulnerability', {
        projectId: project.id,
        limit: this.limit,
        offset: this.offset,
        ordering: this.ordering,
      })) as OverdueVulnerabilitiesResponse;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OverdueVulnerabilities: typeof OverdueVulnerabilitiesComponent;
  }
}
