import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import OrganizationTeamModel from 'irene/models/organization-team';
import OrganizationModel from 'irene/models/organization';
import { ActionContentType } from '../details/active-action';

export interface OrganizationTeamEditTeamNameComponentSignature {
  Args: {
    team: OrganizationTeamModel;
    organization: OrganizationModel;
    cancelActiveAction: () => void;
  };
  Element: HTMLElement;
  Blocks: {
    default: () => void;
    actionContent: [ActionContentType];
  };
}

export default class OrganizationTeamEditTeamName extends Component<OrganizationTeamEditTeamNameComponentSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

  @tracked teamName = '';

  constructor(
    owner: unknown,
    args: OrganizationTeamEditTeamNameComponentSignature['Args']
  ) {
    super(owner, args);

    this.teamName = this.args.team.name;
  }

  get teamNameEmptyOrSame() {
    return (
      this.teamName.trim() === '' ||
      this.teamName.trim() === this.args.team.name
    );
  }

  updateTeamName = task(async () => {
    try {
      const team = this.args.team;

      team.name = this.teamName;
      await team.save();

      this.notify.success(this.intl.t('organizationTeamNameUpdated'));

      this.args.cancelActiveAction();
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
    'OrganizationTeam::EditTeamName': typeof OrganizationTeamEditTeamName;
    'organization-team/edit-team-name': typeof OrganizationTeamEditTeamName;
  }
}
