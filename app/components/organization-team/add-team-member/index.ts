import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { debounceTask } from 'ember-lifeline';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import RealtimeService from 'irene/services/realtime';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import OrganizationTeamModel from 'irene/models/organization-team';
import OrganizationUserModel from 'irene/models/organization-user';
import { ActionContentType } from '../details/active-action';
import { waitForPromise } from '@ember/test-waiters';

export interface OrganizationTeamAddTeamMemberComponentSignature {
  Args: {
    team: OrganizationTeamModel;
  };
  Element: HTMLElement;
  Blocks: {
    default: () => void;
    actionContent: [ActionContentType];
  };
}

type UserResponseModel =
  DS.AdapterPopulatedRecordArray<OrganizationUserModel> & {
    meta?: { count: number };
  };

type SelectedMemberModel = Record<string, OrganizationUserModel>;

export default class OrganizationTeamAddTeamMemberComponent extends Component<OrganizationTeamAddTeamMemberComponentSignature> {
  @service declare intl: IntlService;
  @service declare realtime: RealtimeService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked searchQuery = '';
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked userResponse: UserResponseModel | null = null;
  @tracked isAddingMember = false;
  @tracked addMemberErrorCount = 0;
  @tracked selectedMembers: SelectedMemberModel = {};

  constructor(
    owner: unknown,
    args: OrganizationTeamAddTeamMemberComponentSignature['Args']
  ) {
    super(owner, args);

    this.fetchUsers.perform(this.limit, this.offset);
  }

  get userList() {
    const list = this.userResponse?.slice() || [];

    return list.map((user) => ({
      user,
      checked: !!this.selectedMembers[user.id],
    }));
  }

  get totalUserCount() {
    return this.userResponse?.meta?.count || 0;
  }

  get hasNoUser() {
    return this.totalUserCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('name'),
        valuePath: 'user.username',
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
  selectionChange(member: OrganizationUserModel, event: Event) {
    const selectedMembers = { ...this.selectedMembers };

    if ((event.target as HTMLInputElement).checked) {
      selectedMembers[member.id] = member;
    } else {
      delete selectedMembers[member.id];
    }

    this.selectedMembers = selectedMembers;
  }

  get hasNoSelection() {
    return Object.keys(this.selectedMembers).length === 0;
  }

  /* Add member to team */
  addTeamMember = task({ enqueue: true, maxConcurrency: 3 }, async (member) => {
    try {
      const data = {
        write: false,
      };

      const team = this.args.team;
      await waitForPromise(team.addMember(data, member.id));

      this.realtime.incrementProperty('TeamMemberCounter');
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.addMemberErrorCount = this.addMemberErrorCount + 1;
    }
  });

  addSelectedTeamMembers = task(async () => {
    this.isAddingMember = true;

    const selectedMembers = Object.values(this.selectedMembers);

    if (selectedMembers.length === 0) {
      return;
    }

    for (let i = 0; i < selectedMembers.length; i++) {
      await waitForPromise(this.addTeamMember.perform(selectedMembers[i]));
    }

    if (this.addMemberErrorCount === 0) {
      this.notify.success(this.intl.t('teamMemberAdded'));

      this.fetchUsers.perform(this.limit, this.offset, this.searchQuery);

      this.searchQuery = '';
      this.selectedMembers = {};

      triggerAnalytics(
        'feature',
        ENV.csb['addTeamMember'] as CsbAnalyticsFeatureData
      );
    }

    // reload team to update member count
    await this.args.team.reload();

    this.isAddingMember = false;
  });

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchUsers.perform(limit, offset, this.searchQuery);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchUsers.perform(limit, 0, this.searchQuery);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.searchQuery = query;

    this.fetchUsers.perform(this.limit, 0, query);
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

  fetchUsers = task({ drop: true }, async (limit, offset, query = '') => {
    try {
      const queryParams = {
        limit,
        offset,
        q: query,
        exclude_team: this.args.team.id,
      };

      this.userResponse = await waitForPromise(
        this.store.query('organization-user', queryParams)
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
    'OrganizationTeam::AddTeamMember': typeof OrganizationTeamAddTeamMemberComponent;
  }
}
