import { task } from 'ember-concurrency';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { debounceTask } from 'ember-lifeline';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';
import type ProjectModel from 'irene/models/project';
import type ServiceAccountService from 'irene/services/service-account';
import parseError from 'irene/utils/parse-error';

export interface AdminServiceAccountAddProjectListComponentSignature {
  Args: {
    isCreateView: boolean;
    serviceAccount: ServiceAccountModel;
    refreshSelectedProjects: () => void;
    drawerCloseHandler: () => void;
  };
}

type ProjectResponse = DS.AdapterPopulatedRecordArray<ProjectModel> & {
  meta?: { count: number };
};

type SelectedProjectModel = Record<string, ProjectModel>;

export default class AdminServiceAccountAddProjectListComponent extends Component<AdminServiceAccountAddProjectListComponentSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare serviceAccount: ServiceAccountService;
  @service('notifications') declare notify: NotificationService;

  @tracked searchQuery = '';
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked projectResponse: ProjectResponse | null = null;
  @tracked selectedProjects: SelectedProjectModel = {};

  constructor(
    owner: unknown,
    args: AdminServiceAccountAddProjectListComponentSignature['Args']
  ) {
    super(owner, args);

    if (this.args.isCreateView) {
      this.selectedProjects = this.serviceAccount.selectedProjectsForCreate;
    }

    this.fetchProjects.perform(this.limit, this.offset);
  }

  get projectList() {
    const list = this.projectResponse?.slice() || [];

    return list.map((project) => ({
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
        component: 'admin/service-account/add-project/list/name',
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
  selectionChange(project: ProjectModel, event: Event) {
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

  addSelectedProjects = task(async () => {
    const selectedProjects = Object.values(this.selectedProjects);
    let addProjectErrorCount = 0;

    if (selectedProjects.length === 0) {
      return;
    }

    for (let i = 0; i < selectedProjects.length; i++) {
      const project = selectedProjects[i] as ProjectModel;

      const hasErrored = await waitForPromise(
        this.serviceAccount.addProjectToServiceAccount.perform(
          project,
          this.args.serviceAccount
        )
      );

      if (hasErrored) {
        addProjectErrorCount++;
      }
    }

    if (addProjectErrorCount === 0) {
      // close the drawer
      this.args.drawerCloseHandler();

      this.notify.success(
        this.intl.t('serviceAccountModule.addProjectSuccessMsg')
      );

      // refresh selected project list
      this.args.refreshSelectedProjects();
    }
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

  @action
  handleAddSelectedProjects() {
    if (this.args.isCreateView) {
      this.serviceAccount.selectedProjectsForCreate = this.selectedProjects;

      // close the drawer
      this.args.drawerCloseHandler();
    } else {
      this.addSelectedProjects.perform();
    }
  }

  fetchProjects = task(async (limit, offset, query = '') => {
    try {
      const queryParams: Record<string, unknown> = {
        limit,
        offset,
        q: query,
      };

      if (!this.args.isCreateView) {
        queryParams['adapterOptions'] = {
          baseUrlModel: 'service-account',
          id: this.args.serviceAccount.id,
          path: 'excluded_projects',
        };
      }

      this.projectResponse = (await waitForPromise(
        this.store.query('project', queryParams)
      )) as ProjectResponse;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::ServiceAccount::AddProject::List': typeof AdminServiceAccountAddProjectListComponent;
  }
}
