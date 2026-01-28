import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from 'ember-data/store';

import ProjectModel from 'irene/models/project';
import RealtimeService from 'irene/services/realtime';
import parseError from 'irene/utils/parse-error';
import OrganizationMemberModel from 'irene/models/organization-member';
import { action } from '@ember/object';

interface ProjectSettingsGeneralSettingsAddProjectCollaboratorTableActionSignature {
  Args: {
    member: OrganizationMemberModel;
    project: ProjectModel | null;
    handleReloadCollaborators: () => void;
    resetSearchQuery: () => void;
  };
}

export default class ProjectSettingsGeneralSettingsAddProjectCollaboratorTableActionComponent extends Component<ProjectSettingsGeneralSettingsAddProjectCollaboratorTableActionSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare realtime: RealtimeService;
  @service('notifications') declare notify: NotificationService;

  get member() {
    return this.args.member;
  }

  get tProjectCollaboratorAdded() {
    return this.intl.t('projectCollaboratorAdded');
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  @action addCollaborator() {
    this.addProjectCollaborator.perform();
  }

  addProjectCollaborator = task(async () => {
    try {
      const data = {
        write: false,
      };

      const prj = await this.store.findRecord(
        'organization-project',
        String(this.args.project?.id)
      );

      await prj.addCollaborator(data, this.member.id);

      this.realtime.incrementProperty('ProjectCollaboratorCounter');

      this.notify.success(this.tProjectCollaboratorAdded);
      this.args.resetSearchQuery();
      this.args.handleReloadCollaborators();
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  });
}
