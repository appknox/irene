import { task } from 'ember-concurrency';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class OrganizationTeamAddTeamProjectComponent extends Component {
  @service intl;
  @service realtime;
  @service store;
  @service('notifications') notify;

  @tracked searchQuery = '';
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked projectResponse = null;
  @tracked isAddingProject = false;
  @tracked addProjectErrorCount = 0;
  @tracked selectedProjects = {};

  tTeamProjectAdded = this.intl.t('teamProjectAdded');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);

    this.fetchProjects.perform(this.limit, this.offset);
  }

  get projectList() {
    const list = this.projectResponse?.toArray() || [];

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
  selectionChange(project, event) {
    const selectedProjects = { ...this.selectedProjects };

    if (event.target.checked) {
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
        await team.addProject(data, project.id);

        this.realtime.incrementProperty('TeamProjectCounter');
      } catch (err) {
        let errMsg = this.tPleaseTryAgain;

        if (err.errors && err.errors.length) {
          errMsg = err.errors[0].detail || errMsg;
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
      await this.addTeamProject.perform(selectedProjects[i]);
    }

    if (this.addProjectErrorCount === 0) {
      this.notify.success(this.tTeamProjectAdded);

      this.fetchProjects.perform(this.limit, this.offset, this.searchQuery);

      this.selectedProjects = {};
      this.searchQuery = '';
    }

    // reload team to update project count
    await this.args.team.reload();

    this.isAddingProject = false;
  });

  @action
  handleNextPrevAction({ limit, offset }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchProjects.perform(limit, offset, this.searchQuery);
  }

  @action
  handleItemPerPageChange({ limit }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchProjects.perform(limit, 0, this.searchQuery);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query) {
    this.searchQuery = query;

    this.fetchProjects.perform(this.limit, 0, query);
  }

  @action
  handleSearchQueryChange(event) {
    debounce(this, this.setSearchQuery, event.target.value, 500);
  }

  fetchProjects = task({ drop: true }, async (limit, offset, query = '') => {
    try {
      const queryParams = {
        limit,
        offset,
        q: query,
        exclude_team: this.args.team.id,
      };

      this.projectResponse = await this.store.query(
        'organization-project',
        queryParams
      );
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}
