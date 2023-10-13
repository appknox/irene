// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import { action } from '@ember/object';
import OrganizationTeamModel from 'irene/models/organization-team';
import ProjectModel from 'irene/models/project';
import { debounce } from '@ember/runloop';
import parseError from 'irene/utils/parse-error';

interface LimitOffset {
  limit: number;
  offset: number;
}

type OrganizationTeamRecordModelArray =
  DS.AdapterPopulatedRecordArray<OrganizationTeamModel> & {
    meta: { count: number };
  };

interface ProjectSettingsGeneralSettingsAddProjectTeamTableSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsAddProjectTeamTableComponent extends Component<ProjectSettingsGeneralSettingsAddProjectTeamTableSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked query = '';
  @tracked searchQuery = '';
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked
  orgTeamRecordResponse: OrganizationTeamRecordModelArray | null = null;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsAddProjectTeamTableSignature['Args']
  ) {
    super(owner, args);

    this.fetchOrganizationTeams.perform();
  }

  get columns() {
    return [
      {
        name: this.intl.t('name'),
        valuePath: 'name',
        width: 200,
      },
      {
        name: this.intl.t('action'),
        component:
          'project-settings/general-settings/add-project-team/table/action',
        width: 20,
        textAlign: 'center',
      },
    ];
  }

  get organizationTeams() {
    return this.orgTeamRecordResponse?.toArray().sortBy('created:desc') || [];
  }

  get hasNoOrgTeams() {
    return this.organizationTeams.length < 1;
  }

  get orgTeamsTotalCount() {
    return this.orgTeamRecordResponse?.meta.count || 0;
  }

  updateSearchQuery() {
    this.searchQuery = this.query;
    this.fetchOrganizationTeams.perform();
  }

  @action setSearchQuery() {
    debounce(this, this.updateSearchQuery, 500);
  }

  @action
  handleReloadTeams() {
    this.fetchOrganizationTeams.perform();
  }

  // Table Actions
  @action goToPage(args: LimitOffset) {
    const { limit, offset } = args;

    this.limit = limit;
    this.offset = offset;

    this.fetchOrganizationTeams.perform();
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { limit } = args;
    const offset = 0;

    this.limit = limit;
    this.offset = offset;

    this.fetchOrganizationTeams.perform();
  }

  @action
  resetSearchQuery() {
    this.query = '';
  }

  fetchOrganizationTeams = task({ drop: true }, async () => {
    try {
      const queryParams = {
        limit: this.limit,
        offset: this.offset,
        q: this.searchQuery,
        exclude_project: this.args.project?.id,
      };

      this.orgTeamRecordResponse = (await this.store.query(
        'organization-team',
        queryParams
      )) as OrganizationTeamRecordModelArray;
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::AddProjectTeam::Table': typeof ProjectSettingsGeneralSettingsAddProjectTeamTableComponent;
  }
}
