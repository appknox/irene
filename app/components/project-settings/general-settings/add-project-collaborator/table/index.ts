// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import { action } from '@ember/object';
import ProjectModel from 'irene/models/project';
import { debounce } from '@ember/runloop';
import OrganizationMemberModel from 'irene/models/organization-member';
import parseError from 'irene/utils/parse-error';

interface LimitOffset {
  limit: number;
  offset: number;
}

type OrganizationMemberRecordModelArray =
  DS.AdapterPopulatedRecordArray<OrganizationMemberModel> & {
    meta: { count: number };
  };

interface ProjectSettingsGeneralSettingsAddProjectCollaboratorTableSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsAddProjectCollaboratorTableComponent extends Component<ProjectSettingsGeneralSettingsAddProjectCollaboratorTableSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked query = '';
  @tracked searchQuery = '';
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked
  orgMemberRecordResponse: OrganizationMemberRecordModelArray | null = null;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsAddProjectCollaboratorTableSignature['Args']
  ) {
    super(owner, args);

    this.fetchOrganizationMembers.perform();
  }

  get columns() {
    return [
      {
        name: this.intl.t('name'),
        valuePath: 'member.username',
        width: 200,
      },
      {
        name: this.intl.t('action'),
        component:
          'project-settings/general-settings/add-project-collaborator/table/action',
        width: 20,
        textAlign: 'center',
      },
    ];
  }

  get orgMembers() {
    return this.orgMemberRecordResponse?.slice().sortBy('created:desc') || [];
  }

  get hasNoOrgMembers() {
    return this.orgMembers.length < 1;
  }

  get orgMembersTotalCount() {
    return this.orgMemberRecordResponse?.meta.count || 0;
  }

  updateSearchQuery() {
    this.searchQuery = this.query;
    this.fetchOrganizationMembers.perform();
  }

  @action setSearchQuery() {
    debounce(this, this.updateSearchQuery, 500);
  }

  @action
  handleReloadCollaborators() {
    this.fetchOrganizationMembers.perform();
  }

  // Table Actions
  @action goToPage(args: LimitOffset) {
    const { limit, offset } = args;

    this.limit = limit;
    this.offset = offset;

    this.fetchOrganizationMembers.perform();
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { limit } = args;
    const offset = 0;

    this.limit = limit;
    this.offset = offset;

    this.fetchOrganizationMembers.perform();
  }

  @action
  resetSearchQuery() {
    this.query = '';
  }

  fetchOrganizationMembers = task({ drop: true }, async () => {
    try {
      const queryParams = {
        limit: this.limit,
        offset: this.offset,
        q: this.searchQuery,

        // TODO: No filters exist to exclude projects in the backend
        // exclude_project: this.args.project?.id,
      };

      this.orgMemberRecordResponse = (await this.store.query(
        'organization-member',
        queryParams
      )) as OrganizationMemberRecordModelArray;
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::AddProjectCollaborator::Table': typeof ProjectSettingsGeneralSettingsAddProjectCollaboratorTableComponent;
  }
}
