/* eslint-disable ember/no-observers */
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import Store from '@ember-data/store';
import { action } from '@ember/object';

import ProjectTeamModel from 'irene/models/project-team';
import { PaginationProviderActionsArgs } from '../ak-pagination-provider';
import MeService from 'irene/services/me';
import RealtimeService from 'irene/services/realtime';
import ProjectModel from 'irene/models/project';
import { addObserver, removeObserver } from '@ember/object/observers';

type ProjectTeamQueryResponse =
  DS.AdapterPopulatedRecordArray<ProjectTeamModel> & {
    meta: { count: number };
  };

interface ProjectTeamListSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectTeamListComponent extends Component<ProjectTeamListSignature> {
  @service declare me: MeService;
  @service declare store: Store;
  @service declare realtime: RealtimeService;

  @tracked projectTeamListResponse: ProjectTeamQueryResponse | null = null;
  @tracked offset = 0;
  @tracked limit = 10;

  // TODO: add sort team list functionality
  sortProperties = ['created:desc'];

  constructor(owner: unknown, args: ProjectTeamListSignature['Args']) {
    super(owner, args);

    addObserver(
      this.realtime,
      'ProjectTeamCounter',
      this,
      this.reloadProjectTeamList
    );
  }

  get projectTeamList() {
    return this.projectTeamListResponse?.toArray() || [];
  }

  get totalCount() {
    return this.projectTeamListResponse?.meta.count || 0;
  }

  @action goToPage(args: PaginationProviderActionsArgs) {
    const { limit, offset } = args;

    this.limit = limit;
    this.offset = offset;

    this.getProjectTeamList.perform();
  }

  @action onItemPerPageChange(args: PaginationProviderActionsArgs) {
    const { limit } = args;

    this.limit = limit;
    this.offset = 0;

    this.getProjectTeamList.perform();
  }

  @action
  reloadProjectTeamList() {
    this.getProjectTeamList.perform();
  }

  willDestroy(): void {
    super.willDestroy();

    removeObserver(
      this.realtime,
      'ProjectTeamCounter',
      this,
      this.reloadProjectTeamList
    );
  }

  getProjectTeamList = task(async () => {
    this.projectTeamListResponse = (await this.store.query('project-team', {
      limit: this.limit,
      offset: this.offset,
      projectId: this.args.project?.id,
    })) as ProjectTeamQueryResponse;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectTeamList: typeof ProjectTeamListComponent;
    'project-team-list': typeof ProjectTeamListComponent;
  }
}

// store.query => Makes an API call
// store.findRecord => checks the store if the is a cached (if true it returns the data) else it makes an API call
// store.queryRecord => Makes an API call
