import { task } from 'ember-concurrency';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { debounceTask } from 'ember-lifeline';
import { tracked } from '@glimmer/tracking';
import Store from 'ember-data/store';
import IntlService from 'ember-intl/services/intl';
import RealtimeService from 'irene/services/realtime';
import OrganizationTeamModel from 'irene/models/organization-team';
import OrganizationProjectModel from 'irene/models/organization-project';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import { ActionContentType } from '../details/active-action';
import { waitForPromise } from '@ember/test-waiters';

export interface OrganizationTeamAddTeamProjectComponentSignature {
  Args: {
    team: OrganizationTeamModel;
  };
  Element: HTMLElement;
  Blocks: {
    default: () => void;
    actionContent: [ActionContentType];
  };
}

type SelectedProjectModel = Record<string, OrganizationProjectModel>;

type ProjectResponseModel =
  DS.AdapterPopulatedRecordArray<OrganizationProjectModel> & {
    meta?: { count: number };
  };

export default class OrganizationTeamAddTeamProjectComponent extends Component<OrganizationTeamAddTeamProjectComponentSignature> {
  @service declare intl: IntlService;
  @service declare realtime: RealtimeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked searchQuery = '';
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked projectResponse: ProjectResponseModel | null = null;
  @tracked isAddingProject = false;
  @tracked addProjectErrorCount = 0;
  @tracked selectedProjects: SelectedProjectModel = {};

  constructor(
    owner: unknown,
    args: OrganizationTeamAddTeamProjectComponentSignature['Args']
  ) {
    super(owner, args);

    this.fetchProjects.perform(this.limit, this.offset);
  }

  get projectList() {
    const list = this.projectResponse?.slice() || [];

    return list.map((project: OrganizationProjectModel) => ({
      project,
      checked: !!this.selectedProjects[project.id],
    }));
  }

  get totalProjectCount() {
    return this.projectResponse?.meta?.count || 0;
  }

  get hasNoProject() {
    return this.totalProjectCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('name'),
        component: 'organization-team/add-team-project/project-info',
        minWidth: 250,
      },
      {
        name: this.intl.t('action'),
        component: 'ak-checkbox',
        textAlign: 'center',
      },
    ];
  }

  @action
  selectionChange(project: OrganizationProjectModel, event: Event) {
    const selectedProjects = { ...this.selectedProjects };

    if ((event.target as HTMLInputElement).checked) {
      selectedProjects[project.id] = project;
    } else {
      delete selectedProjects[project.id];
    }

    this.selectedProjects = selectedProjects;
  }

  get hasNoSelection() {
    return Object.keys(this.selectedProjects).length === 0;
  }

  /* Add project to team */
  addTeamProject = task(
    { enqueue: true, maxConcurrency: 3 },
    async (project) => {
      try {
        const data = {
          write: false,
        };

        const team = this.args.team;
        await waitForPromise(team.addProject(data, project.id));

        this.realtime.incrementProperty('TeamProjectCounter');
      } catch (e) {
        const err = e as AdapterError;
        let errMsg = this.intl.t('pleaseTryAgain');

        if (err.errors && err.errors.length) {
          errMsg = err.errors[0]?.detail || errMsg;
        } else if (err.message) {
          errMsg = err.message;
        }

        this.notify.error(errMsg);
        this.addProjectErrorCount = this.addProjectErrorCount + 1;
      }
    }
  );

  addSelectedTeamProjects = task(async () => {
    this.isAddingProject = true;

    const selectedProjects = Object.values(this.selectedProjects);

    if (selectedProjects.length === 0) {
      return;
    }

    for (let i = 0; i < selectedProjects.length; i++) {
      await waitForPromise(this.addTeamProject.perform(selectedProjects[i]));
    }

    if (this.addProjectErrorCount === 0) {
      this.notify.success(this.intl.t('teamProjectAdded'));

      this.fetchProjects.perform(this.limit, this.offset, this.searchQuery);

      this.selectedProjects = {};
      this.searchQuery = '';
    }

    // reload team to update project count
    await waitForPromise(this.args.team.reload());

    this.isAddingProject = false;
  });

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchProjects.perform(limit, offset, this.searchQuery);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchProjects.perform(limit, 0, this.searchQuery);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.searchQuery = query;

    this.fetchProjects.perform(this.limit, 0, query);
  }

  @action
  handleSearchQueryChange(event: Event) {
    debounceTask(
      this,
      'setSearchQuery',
      (event.target as HTMLInputElement).value,
      500
    );
  }

  fetchProjects = task({ drop: true }, async (limit, offset, query = '') => {
    try {
      const queryParams = {
        limit,
        offset,
        q: query,
        exclude_team: this.args.team.id,
      };

      this.projectResponse = await waitForPromise(
        this.store.query('organization-project', queryParams)
      );
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

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::AddTeamProject': typeof OrganizationTeamAddTeamProjectComponent;
  }
}
