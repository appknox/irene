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

import MeService from 'irene/services/me';
import RealtimeService from 'irene/services/realtime';
import ProjectModel from 'irene/models/project';
import { addObserver, removeObserver } from '@ember/object/observers';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import ProjectCollaboratorModel from 'irene/models/project-collaborator';

type ProjectCollaboratorsQueryResponse =
  DS.AdapterPopulatedRecordArray<ProjectCollaboratorModel> & {
    meta: { count: number };
  };

interface ProjectSettingsGeneralSettingsCollaboratorsTableSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsCollaboratorsTableComponent extends Component<ProjectSettingsGeneralSettingsCollaboratorsTableSignature> {
  @service declare me: MeService;
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare realtime: RealtimeService;

  @tracked
  projectCollaboratorsResponse: ProjectCollaboratorsQueryResponse | null = null;
  @tracked offset = 0;
  @tracked limit = 10;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsCollaboratorsTableSignature['Args']
  ) {
    super(owner, args);

    addObserver(
      this.realtime,
      'ProjectCollaboratorCounter',
      this,
      this.reloadProjectCollaborators
    );

    this.getProjectCollaborators.perform();
  }

  get projectCollaborators() {
    return (
      this.projectCollaboratorsResponse?.toArray().sortBy('created:desc') || []
    );
  }

  get hasNoProjectCollaborators() {
    return this.projectCollaborators.length < 1;
  }

  get totalCount() {
    return this.projectCollaboratorsResponse?.meta.count || 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('collaborators'),
        component:
          'project-settings/general-settings/collaborators-table/collaborators',
        width: 100,
      },
      this.me.org?.is_admin
        ? {
            name: this.intl.t('editAccess'),
            component:
              'project-settings/general-settings/collaborators-table/edit-access',
            width: 100,
            textAlign: 'center',
          }
        : null,
      this.me.org?.is_admin
        ? {
            name: this.intl.t('action'),
            component:
              'project-settings/general-settings/collaborators-table/action',
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

    this.getProjectCollaborators.perform();
  }

  @action onItemPerPageChange(args: PaginationProviderActionsArgs) {
    const { limit } = args;

    this.limit = limit;
    this.offset = 0;

    this.getProjectCollaborators.perform();
  }

  @action
  reloadProjectCollaborators() {
    this.getProjectCollaborators.perform();
  }

  willDestroy(): void {
    super.willDestroy();

    removeObserver(
      this.realtime,
      'ProjectCollaboratorCounter',
      this,
      this.reloadProjectCollaborators
    );
  }

  getProjectCollaborators = task(async () => {
    this.projectCollaboratorsResponse = (await this.store.query(
      'project-collaborator',
      {
        limit: this.limit,
        offset: this.offset,
        projectId: this.args.project?.id,
      }
    )) as ProjectCollaboratorsQueryResponse;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::CollaboratorsTable': typeof ProjectSettingsGeneralSettingsCollaboratorsTableComponent;
  }
}
