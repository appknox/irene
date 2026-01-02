import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from 'ember-data/store';

import ProjectModel from 'irene/models/project';
import OrganizationTeamModel from 'irene/models/organization-team';
import RealtimeService from 'irene/services/realtime';
import parseError from 'irene/utils/parse-error';

interface ProjectSettingsGeneralSettingsAddProjectTeamTableActionSignature {
  Args: {
    team: OrganizationTeamModel;
    project: ProjectModel | null;
    handleReloadTeams: () => void;
    resetSearchQuery: () => void;
  };
}

export default class ProjectSettingsGeneralSettingsAddProjectTeamTableActionComponent extends Component<ProjectSettingsGeneralSettingsAddProjectTeamTableActionSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare realtime: RealtimeService;
  @service('notifications') declare notify: NotificationService;

  get team() {
    return this.args.team;
  }

  get tProjectTeamAdded() {
    return this.intl.t('projectTeamAdded');
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  addProjectTeam = task(async () => {
    try {
      const data = {
        write: false,
      };

      await this.team.addProject(data, String(this.args.project?.id));
      this.realtime.incrementProperty('ProjectTeamCounter');

      this.notify.success(this.tProjectTeamAdded);
      this.args.resetSearchQuery();
      this.args.handleReloadTeams();
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  });
}
