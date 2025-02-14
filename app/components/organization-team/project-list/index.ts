import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { capitalize } from '@ember/string';
import { debounceTask } from 'ember-lifeline';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import Store from '@ember-data/store';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import OrganizationTeamModel from 'irene/models/organization-team';
import OrganizationTeamProjectModel from 'irene/models/organization-team-project';
import OrganizationModel from 'irene/models/organization';
import { ActiveActionDetailsType } from '../details/active-action';

type TeamProjectResponseModel =
  DS.AdapterPopulatedRecordArray<OrganizationTeamProjectModel> & {
    meta?: { count: number };
  };

export interface OrganizationTeamProjectListComponentSignature {
  Args: {
    handleActiveAction: (actionArgs: ActiveActionDetailsType) => void;
    team: OrganizationTeamModel;
    organization: OrganizationModel;
  };
  Element: HTMLElement;
}

export default class OrganizationTeamProjectListComponent extends Component<OrganizationTeamProjectListComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked searchQuery = '';
  @tracked limit = 5;
  @tracked offset = 0;
  @tracked teamProjectResponse: TeamProjectResponseModel | null = null;

  constructor(
    owner: unknown,
    args: OrganizationTeamProjectListComponentSignature['Args']
  ) {
    super(owner, args);
    this.fetchTeamProjects.perform(this.limit, this.offset);
  }

  get teamProjectList() {
    return this.teamProjectResponse?.slice() || [];
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
      this.me.org?.get('is_admin')
        ? {
            name: this.intl.t('accessPermissions'),
            component: 'organization-team/project-list/access-permission',
          }
        : null,
      this.me.org?.get('is_admin')
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
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchTeamProjects.perform(limit, offset, this.searchQuery);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchTeamProjects.perform(limit, 0, this.searchQuery);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.searchQuery = query;
    this.fetchTeamProjects.perform(this.limit, 0, query);
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
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationTeam::ProjectList': typeof OrganizationTeamProjectListComponent;
  }
}
