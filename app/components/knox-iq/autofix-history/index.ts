import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';
import { task } from 'ember-concurrency';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type AutofixPRModel from 'irene/models/autofix-pr';
import type { AutofixPRCommit } from 'irene/models/autofix-pr';
import type ProjectModel from 'irene/models/project';
import parseError from 'irene/utils/parse-error';

const COMMIT_SHA_PREVIEW_LENGTH = 7;

interface AutofixHistoryQueryParams {
  autofix_limit: string | number;
  autofix_offset: string | number;
  file_id?: string | number;
}

interface KnoxIqAutofixHistorySignature {
  Args: {
    project: ProjectModel;
    queryParams: AutofixHistoryQueryParams;
  };
}

interface AutofixRunColumn {
  name: string;
  valuePath: 'baseBranch' | 'branch' | 'commitSha' | 'updatedOn';
  width?: number;
}

export interface AutofixRun {
  id: string;
  baseBranch: string;
  branch: string;
  commitSha: string;
  shortSha: string;
  commitUrl: string;
  fileId: number;
  patchedFiles: string[];
  updatedOn: string;
}

type AutofixPRQueryResponse = DS.AdapterPopulatedRecordArray<AutofixPRModel> & {
  meta: { count: number };
};

export default class KnoxIqAutofixHistoryComponent extends Component<KnoxIqAutofixHistorySignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked autofixPRResponse: AutofixPRQueryResponse | null = null;
  @tracked selectedRun: AutofixRun | null = null;

  constructor(owner: unknown, args: KnoxIqAutofixHistorySignature['Args']) {
    super(owner, args);

    this.fetchAutofixHistory.perform();
  }

  get limit() {
    return Number(this.args.queryParams.autofix_limit);
  }

  get offset() {
    return Number(this.args.queryParams.autofix_offset);
  }

  get autofixPRs() {
    return this.autofixPRResponse?.slice() ?? [];
  }

  get totalAutofixPRs() {
    return this.autofixPRResponse?.meta.count ?? 0;
  }

  get runs(): AutofixRun[] {
    return this.autofixPRs.flatMap((pr) =>
      (pr.commits ?? []).map((commit) => this.toRun(pr, commit))
    );
  }

  get isInitialLoading() {
    return this.fetchAutofixHistory.isRunning && !this.autofixPRResponse;
  }

  get hasNoHistory() {
    return !this.fetchAutofixHistory.isRunning && this.runs.length === 0;
  }

  get columns(): AutofixRunColumn[] {
    return [
      {
        name: this.intl.t('autofix.baseBranch'),
        valuePath: 'baseBranch',
      },
      {
        name: this.intl.t('autofix.branch'),
        valuePath: 'branch',
      },
      {
        name: this.intl.t('autofix.commit'),
        valuePath: 'commitSha',
        width: 160,
      },
      {
        name: this.intl.t('autofix.updated'),
        valuePath: 'updatedOn',
        width: 160,
      },
    ];
  }

  toRun(pr: AutofixPRModel, commit: AutofixPRCommit): AutofixRun {
    const commitSha = commit.commit_sha;

    return {
      id: `${pr.id}-${commit.id}`,
      baseBranch: pr.baseBranch,
      branch: pr.branch,
      commitSha,
      shortSha: commitSha.slice(0, COMMIT_SHA_PREVIEW_LENGTH),
      commitUrl: `https://github.com/${pr.repo}/commit/${commitSha}`,
      fileId: commit.file,
      patchedFiles: commit.patched_files ?? [],
      updatedOn: commit.created_on,
    };
  }

  @action
  updatePagination({ limit, offset }: PaginationProviderActionsArgs) {
    this.router.transitionTo({
      queryParams: {
        autofix_limit: limit,
        autofix_offset: offset,
        file_id: this.args.queryParams.file_id,
      },
    });
  }

  @action
  refetchHistory() {
    this.closeRun();
    this.fetchAutofixHistory.perform();
  }

  @action
  openRun({ rowValue }: { rowValue: AutofixRun }) {
    this.selectedRun = rowValue;
  }

  @action
  closeRun() {
    this.selectedRun = null;
  }

  @action
  stopRowNavigation(event: Event) {
    event.stopPropagation();
  }

  fetchAutofixHistory = task(async () => {
    try {
      this.autofixPRResponse = (await waitForPromise(
        this.store.query('autofix-pr', {
          projectId: this.args.project.id,
          fileId: this.args.queryParams.file_id,
          limit: this.limit,
          offset: this.offset,
        })
      )) as AutofixPRQueryResponse;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('autofix.fetchError')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::AutofixHistory': typeof KnoxIqAutofixHistoryComponent;
  }
}
