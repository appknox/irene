import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { debounceTask } from 'ember-lifeline';
import { tracked } from '@glimmer/tracking';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type MeService from 'irene/services/me';
import type OrganizationMemberModel from 'irene/models/organization-member';
import type OrganizationModel from 'irene/models/organization';
import type OrganizationProjectModel from 'irene/models/organization-project';

import styles from './index.scss';

interface AdminSettingsUserDetailsAppknoxInfoProjectsComponentSignature {
  Args: {
    organization: OrganizationModel | null;
    member: OrganizationMemberModel | null;
  };
  Element: HTMLElement;
}

type OrgProjectResponseArray =
  DS.AdapterPopulatedRecordArray<OrganizationProjectModel> & {
    meta: { count: number };
  };

export default class AdminSettingsUserDetailsAppknoxInfoProjectsComponent extends Component<AdminSettingsUserDetailsAppknoxInfoProjectsComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked searchQuery = '';
  @tracked limit = 5;
  @tracked offset = 0;
  @tracked projectsResponse: OrgProjectResponseArray | null = null;
  @tracked showAddToTeamsDrawer = false;

  constructor(
    owner: unknown,
    args: AdminSettingsUserDetailsAppknoxInfoProjectsComponentSignature['Args']
  ) {
    super(owner, args);
    this.fetchProjects.perform(this.limit, this.offset);
  }

  get projectList() {
    return this.projectsResponse?.slice() || [];
  }

  get totalProjectCount() {
    return this.projectsResponse?.meta?.count || 0;
  }

  get hasNoProject() {
    return this.totalProjectCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('name'),
        minWidth: 250,
        component: 'admin-settings/user-details/appknox-info/project-info',
      },
      {
        name: this.intl.t('action'),
        component: 'admin-settings/user-details/appknox-info/projects/action',
        textAlign: 'right',
      },
    ];
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

  get classes() {
    return { textFieldRootClass: styles['projects-search-query-root-class'] };
  }

  @action
  setSearchQuery(query: string) {
    this.searchQuery = query;
    this.offset = 0;

    this.fetchProjects.perform(this.limit, this.offset, query);
  }

  @action
  handleSearchQueryChange(event: Event) {
    debounceTask(
      this,
      'setSearchQuery',
      (event.target as HTMLInputElement)?.value,
      500
    );
  }

  @action
  handleFetchProjects(limit: number, offset: number) {
    this.fetchProjects.perform(limit, offset, this.searchQuery);
  }

  @action
  launchAddToTeamDrawer() {
    this.showAddToTeamsDrawer = true;
  }

  @action
  closeAddToTeamsDrawer() {
    this.showAddToTeamsDrawer = false;
  }

  @action
  handleReloadProjects() {
    this.fetchProjects.perform(this.limit, this.offset, this.searchQuery);
  }

  fetchProjects = task({ drop: true }, async (limit, offset, query = '') => {
    try {
      const queryParams = {
        limit,
        offset,
        q: query,
        // TODO: Add include_user prop
        // include_user: this.args.member?.get('id'),
      };

      this.projectsResponse = (await this.store.query(
        'organization-project',
        queryParams
      )) as OrgProjectResponseArray;
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::AppknoxInfo::Projects': typeof AdminSettingsUserDetailsAppknoxInfoProjectsComponent;
  }
}
