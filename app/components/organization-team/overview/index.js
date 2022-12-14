import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganizationTeamOverview extends Component {
  @service intl;
  @service me;
  @service store;

  @tracked isDeletingTeam = false;
  @tracked showDeleteTeamPrompt = false;
  @tracked firstMemberName = '';
  @tracked firstProjectName = '';

  tEnterRightTeamName = this.intl.t('enterRightTeamName');
  tTeamDeleted = this.intl.t('teamDeleted');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);

    this.fetchFirstTeamMemberName.perform();
    this.fetchFirstProjectName.perform();
  }

  @task
  *fetchFirstTeamMemberName() {
    if (this.args.team.membersCount > 0) {
      const members = yield this.args.team.members;
      const user = yield members.firstObject.user;

      this.firstMemberName = user.username;
    }
  }

  get remaingMembersCount() {
    return this.args.team.membersCount - 1;
  }

  @task
  *fetchFirstProjectName() {
    if (this.args.team.projectsCount > 0) {
      const projects = yield this.store.query('organization-team-project', {
        teamId: this.args.team.id,
      });

      const project = yield this.store.findRecord(
        'project',
        projects.firstObject.id
      );

      this.firstProjectName = project.packageName;
    }
  }

  get remaingProjectsCount() {
    return this.args.team.projectsCount - 1;
  }

  /* Open delete-team confirmation */
  @action
  openDeleteTeamConfirmBox() {
    this.showDeleteTeamPrompt = true;
  }

  /* Delete team */
  @task
  *confirmDelete(inputValue) {
    try {
      this.isDeletingTeam = true;

      const t = this.args.team;
      const teamName = t.name.toLowerCase();
      const promptedTeam = inputValue.toLowerCase();

      if (promptedTeam !== teamName) {
        throw new Error(this.tEnterRightTeamName);
      }

      t.deleteRecord();
      yield t.save();

      this.notify.success(`${this.args.team.name} ${this.tTeamDeleted}`);

      this.showDeleteTeamPrompt = false;
      this.isDeletingTeam = false;
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.isDeletingTeam = false;
    }
  }

  @action
  showTeamDetails() {
    this.args.showTeamDetails(this.args.team);
  }
}
