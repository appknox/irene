import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { capitalize } from '@ember/string';
import { debounce } from '@ember/runloop';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class OrganizationTeamProjectListComponent extends Component {
  @service intl;
  @service me;
  @service store;
  @service('notifications') notify;

  @tracked searchQuery = '';
  @tracked limit = 5;
  @tracked offset = 0;
  @tracked teamProjectResponse = null;

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);

    this.fetchTeamProjects.perform(this.limit, this.offset);
  }

  get teamProjectList() {
    return this.teamProjectResponse?.toArray() || [];
  }

  get totalTeamProjectCount() {
    return this.teamProjectResponse?.meta?.count || 0;
  }

  get hasNoTeamProject() {
    return this.totalTeamProjectCount === 0;
  }

  get columns() {
    return [
      {
        name: capitalize(this.intl.t('project')),
        component: 'organization-team/project-list/project-info',
        minWidth: 150,
      },
      this.me.org.get('is_admin')
        ? {
            name: this.intl.t('accessPermissions'),
            component: 'organization-team/project-list/access-permission',
          }
        : null,
      this.me.org.get('is_admin')
        ? {
            name: this.intl.t('action'),
            component: 'organization-team/project-list/project-action',
            textAlign: 'center',
          }
        : null,
    ].filter(Boolean);
  }

  @action
  showAddProjectList() {
    const handleAction = this.args.handleActiveAction;

    handleAction({ component: 'organization-team/add-team-project' });
  }

  @action
  handleNextPrevAction({ limit, offset }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchTeamProjects.perform(limit, offset, this.searchQuery);
  }

  @action
  handleItemPerPageChange({ limit }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchTeamProjects.perform(limit, 0, this.searchQuery);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query) {
    this.searchQuery = query;
    this.fetchTeamProjects.perform(this.limit, 0, query);
  }

  @action
  handleSearchQueryChange(event) {
    debounce(this, this.setSearchQuery, event.target.value, 500);
  }

  @action
  handleReloadTeamProjects() {
    this.fetchTeamProjects.perform(this.limit, this.offset, this.searchQuery);
  }

  fetchTeamProjects = task(
    { drop: true },
    async (limit, offset, query = '') => {
      try {
        const queryParams = {
          limit,
          offset,
          q: query,
          teamId: this.args.team.id,
        };

        this.teamProjectResponse = await this.store.query(
          'organization-team-project',
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
    }
  );
}
