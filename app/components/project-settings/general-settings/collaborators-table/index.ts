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
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import ProjectCollaboratorModel from 'irene/models/project-collaborator';
import parseError from 'irene/utils/parse-error';

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
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;
  @service declare realtime: RealtimeService;

  @tracked
  projectCollaboratorsResponse: ProjectCollaboratorsQueryResponse | null = null;
  @tracked offset = 0;
  @tracked limit = 10;

  get reloadProjectCollaboratorsDependencies() {
    return {
      projectCollaboratorCounter: () =>
        this.realtime.ProjectCollaboratorCounter,
    };
  }

  get projectCollaborators() {
    return (
      this.projectCollaboratorsResponse?.slice().sortBy('created:desc') || []
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

  getProjectCollaborators = task(async () => {
    try {
      this.projectCollaboratorsResponse = (await this.store.query(
        'project-collaborator',
        {
          limit: this.limit,
          offset: this.offset,
          projectId: this.args.project?.id,
        }
      )) as ProjectCollaboratorsQueryResponse;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::CollaboratorsTable': typeof ProjectSettingsGeneralSettingsCollaboratorsTableComponent;
  }
}
