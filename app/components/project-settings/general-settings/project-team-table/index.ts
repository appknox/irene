/* eslint-disable ember/no-observers */
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import Store from '@ember-data/store';
import { action } from '@ember/object';
import IntlService from 'ember-intl/services/intl';
import { waitForPromise } from '@ember/test-waiters';

import ProjectTeamModel from 'irene/models/project-team';
import MeService from 'irene/services/me';
import RealtimeService from 'irene/services/realtime';
import ProjectModel from 'irene/models/project';
import { addObserver, removeObserver } from '@ember/object/observers';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import parseError from 'irene/utils/parse-error';

type ProjectTeamQueryResponse =
  DS.AdapterPopulatedRecordArray<ProjectTeamModel> & {
    meta: { count: number };
  };

interface ProjectSettingsGeneralSettingsProjectTeamTableSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsProjectTeamTableComponent extends Component<ProjectSettingsGeneralSettingsProjectTeamTableSignature> {
  @service declare me: MeService;
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare realtime: RealtimeService;

  @tracked projectTeamListResponse: ProjectTeamQueryResponse | null = null;
  @tracked offset = 0;
  @tracked limit = 10;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsProjectTeamTableSignature['Args']
  ) {
    super(owner, args);

    addObserver(
      this.realtime,
      'ProjectTeamCounter',
      this,
      this.reloadProjectTeamList
    );

    this.getProjectTeamList.perform();
  }

  get projectTeamList() {
    return this.projectTeamListResponse?.slice().sortBy('created:desc') || [];
  }

  get hasNoProjectTeams() {
    return this.projectTeamList.length < 1;
  }

  get totalCount() {
    return this.projectTeamListResponse?.meta.count || 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('teams'),
        component: 'project-settings/general-settings/project-team-table/teams',
        width: 100,
      },
      this.me.org?.is_admin
        ? {
            name: this.intl.t('editAccess'),
            component:
              'project-settings/general-settings/project-team-table/edit-access',
            width: 100,
            textAlign: 'center',
          }
        : null,
      this.me.org?.is_admin
        ? {
            name: this.intl.t('action'),
            component:
              'project-settings/general-settings/project-team-table/action',
            width: 100,
            textAlign: 'right',
          }
        : null,
    ].filter(Boolean);
  }

  @action goToPage(args: PaginationProviderActionsArgs) {
    const { limit, offset } = args;

    this.limit = limit;
    this.offset = offset;

    this.getProjectTeamList.perform();
  }

  @action onItemPerPageChange(args: PaginationProviderActionsArgs) {
    const { limit } = args;

    this.limit = limit;
    this.offset = 0;

    this.getProjectTeamList.perform();
  }

  @action
  reloadProjectTeamList() {
    this.getProjectTeamList.perform();
  }

  willDestroy(): void {
    super.willDestroy();

    removeObserver(
      this.realtime,
      'ProjectTeamCounter',
      this,
      this.reloadProjectTeamList
    );
  }

  @action reloadTeamList() {
    this.getProjectTeamList.perform();
  }

  getProjectTeamList = task(async () => {
    try {
      this.projectTeamListResponse = (await waitForPromise(
        this.store.query('project-team', {
          limit: this.limit,
          offset: this.offset,
          projectId: this.args.project?.id,
        })
      )) as ProjectTeamQueryResponse;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::ProjectTeamTable': typeof ProjectSettingsGeneralSettingsProjectTeamTableComponent;
    'project-settings/general-settings/project-team-table': typeof ProjectSettingsGeneralSettingsProjectTeamTableComponent;
  }
}
