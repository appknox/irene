import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import OrganizationTeamModel from 'irene/models/organization-team';
import OrganizationTeamProjectModel from 'irene/models/organization-team-project';

export interface OrganizationTeamProjectListAccessPermissionComponentSignature {
  Args: {
    project: OrganizationTeamProjectModel;
    team: OrganizationTeamModel;
  };
  Element: HTMLElement;
}

export default class OrganizationTeamProjectListAccessPermission extends Component<OrganizationTeamProjectListAccessPermissionComponentSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  changeProjectWrite = task(async (event, checked) => {
    try {
      const prj = this.args.project;

      prj.write = checked;

      await prj.updateProject(this.args.team.id);

      this.notify.success(this.intl.t('permissionChanged'));
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
    'OrganizationTeam::ProjectList::AccessPermission': typeof OrganizationTeamProjectListAccessPermission;
  }
}
