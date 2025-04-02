import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { debounceTask } from 'ember-lifeline';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type RealtimeService from 'irene/services/realtime';
import type OrganizationProjectModel from 'irene/models/organization-project';
import type OrganizationMemberModel from 'irene/models/organization-member';

export interface AdminSettingsUserDetailsAppknoxInfoAddToProjectComponentSignature {
  Element: HTMLElement;
  Args: {
    member: OrganizationMemberModel | null;
    showAddToProjectsDrawer: boolean;
    handleDrawerClose(): void;
  };
}

type SelectedProjectModel = Record<string, OrganizationProjectModel>;

type ProjectResponseModel =
  DS.AdapterPopulatedRecordArray<OrganizationProjectModel> & {
    meta?: { count: number };
  };

export default class AdminSettingsUserDetailsAppknoxInfoAddToProjectComponent extends Component<AdminSettingsUserDetailsAppknoxInfoAddToProjectComponentSignature> {
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
    args: AdminSettingsUserDetailsAppknoxInfoAddToProjectComponentSignature['Args']
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

  get hasNoSelection() {
    return Object.keys(this.selectedProjects).length === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('name'),
        component: 'admin-settings/user-details/appknox-info/project-info',
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

  @action
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

  addMemberToProject = task(
    { enqueue: true, maxConcurrency: 3 },
    async (project: OrganizationProjectModel) => {
      try {
        const data = {
          write: false,
        };

        const member = this.args.member;

        await waitForPromise(project.addCollaborator(data, String(member?.id)));

        this.realtime.incrementProperty('TeamProjectCounter');
      } catch (e) {
        this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));

        this.addProjectErrorCount = this.addProjectErrorCount + 1;
      }
    }
  );

  addMemberToSelectedProjects = task(async () => {
    const selectedProjects = Object.values(this.selectedProjects);

    if (selectedProjects.length === 0) {
      return;
    }

    this.isAddingProject = true;

    for (let i = 0; i < selectedProjects.length; i++) {
      const prj = this.store.peekRecord(
        'organization-project',
        Number(selectedProjects[i])
      ) as OrganizationProjectModel;

      await waitForPromise(this.addMemberToProject.perform(prj));
    }

    if (this.addProjectErrorCount === 0) {
      this.notify.success(this.intl.t('teamProjectAdded'));

      this.selectedProjects = {};
      this.searchQuery = '';
    }

    // reload project list to update project count
    await waitForPromise(
      this.fetchProjects.perform(this.limit, 0, this.searchQuery)
    );

    this.isAddingProject = false;
  });

  fetchProjects = task({ drop: true }, async (limit, offset, query = '') => {
    try {
      const queryParams = {
        limit,
        offset,
        q: query,
      };

      this.projectResponse = await waitForPromise(
        this.store.query('organization-project', queryParams)
      );
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::AppknoxInfo::AddToProject': typeof AdminSettingsUserDetailsAppknoxInfoAddToProjectComponent;
  }
}
