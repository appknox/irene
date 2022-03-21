import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENUMS from 'irene/enums';

export default class GithubProjectComponent extends Component {
  @service intl;
  @service store;
  @service notifications;
  @service ajax;
  @service organization;

  @tracked currentGithubRepo = null;
  @tracked selectedRepo = null;
  @tracked githubRepos = [];
  @tracked reconnect = false;
  @tracked showDeleteGHConfirmBox = false;
  @tracked showEditGithubModal = false;
  @tracked selectedThreshold = ENUMS.THRESHOLD.LOW;

  tProjectRemoved = this.intl.t('projectRemoved');
  tFailedGitHubProject = this.intl.t('failedGitHubProject');
  tRepoIntegrated = this.intl.t('repoIntegrated');
  invalidProject = this.intl.t('invalidProject');
  tInvalidRisk = this.intl.t('invalidRisk');

  get githubReposEndpoint() {
    const org_id = this.organization.selected.id;
    const url = `/api/organizations/${org_id}/github_repos`;
    return url;
  }

  get project() {
    return this.args.project;
  }

  get hasGitHubProject() {
    if (!this.githubRepos) {
      return false;
    }
    return this.githubRepos.length > 0;
  }

  get thresholds() {
    return ENUMS.THRESHOLD.CHOICES.filter((c) => c.key !== 'UNKNOWN').map(
      (c) => c.value
    );
  }

  @action
  fetchdata() {
    this.setCurrentGithubRepo.perform();
    this.fetchGithubRepos.perform();
  }

  @action
  openDeleteGHConfirmBox() {
    this.showDeleteGHConfirmBox = true;
  }

  @action
  editGithubRepoModal() {
    this.showEditGithubModal = true;
  }

  @action
  selectRepo(repo) {
    this.selectedRepo = repo;
  }

  @action
  selectThreshold(threshold) {
    this.selectedThreshold = threshold;
  }

  @action
  closeGithubRepoModal() {
    this.showEditGithubModal = false;
  }

  @action
  selectProjectAction() {
    this.selectProject.perform();
  }

  @action
  confirmCallback() {
    this.deleteRepo.perform();
  }

  @task(function* () {
    try {
      const githubrepo = yield this.store.findRecord(
        'github-repo',
        this.project.id
      );
      this.currentGithubRepo = githubrepo;
      this.selectedRepo = this.currentGithubRepo.repo_details;
    } catch (err) {
      // TODO
      if (
        err.errors[0].detail &&
        err.errors[0].detail === 'Github not integrated'
      ) {
        this.currentGithubRepo = null;
        return;
      }
      if (
        err.errors[0].detail &&
        err.errors[0].detail === 'Github integration failed'
      ) {
        this.reconnect = true;
        return;
      }
      if (
        err.errors[0].detail &&
        err.errors[0].detail === 'No connected repository'
      ) {
        return;
      }

      this.notifications.error(this.tFailedGitHubProject);
    }
  })
  setCurrentGithubRepo;

  @task(function* () {
    return yield this.ajax.request(this.githubReposEndpoint);
  })
  getGithubRepos;

  @task(function* () {
    try {
      const data = yield this.getGithubRepos.perform();
      this.githubRepos = data.results;
    } catch (error) {
      if (
        error.status === 400 &&
        error.payload.detail === 'Github integration failed'
      ) {
        this.reconnect = true;
        return;
      }

      if (
        error.status === 404 &&
        error.payload.detail === 'Github not integrated'
      ) {
        this.githubRepos = [];
        return;
      }
      this.notifications.error(error.payload.detail);
    }
  })
  fetchGithubRepos;

  @task(function* () {
    let githubRepo = this.currentGithubRepo;

    if (!githubRepo) {
      githubRepo = this.store.createRecord('github-repo', {
        id: this.project.id,
        project: this.project,
      });
    }

    githubRepo.account = this.selectedRepo.owner.login;
    githubRepo.repo = this.selectedRepo.name;
    githubRepo.risk_threshold = this.selectedThreshold;

    try {
      const currentGithubRepo = yield githubRepo.save();
      this.currentGithubRepo = currentGithubRepo;
      this.notifications.success(this.tRepoIntegrated);
      this.showEditGithubModal = false;
    } catch (err) {
      yield githubRepo.rollbackAttributes();
      if (githubRepo.dirtyType === 'deleted') {
        yield githubRepo.unloadRecord();
      }
      if (
        err.errors[0].source.pointer === '/data/attributes/account' &&
        err.errors[1].source.pointer === '/data/attributes/repo'
      ) {
        this.notifications.error(this.invalidProject);
        return;
      }
      if (err.errors[0].source.pointer === '/data/attributes/risk_threshold') {
        this.notifications.error(this.tInvalidRisk);
        return;
      }
      if (err.errors[0].detail === 'Github not integrated') {
        this.showEditGithubModal = false;
        this.githubRepos = null;
        this.currentGithubRepo = null;
      }
      this.notifications.error(err.errors[0].detail);
    }
  })
  selectProject;

  @task(function* () {
    try {
      yield this.currentGithubRepo.destroyRecord();
      this.currentGithubRepo.unloadRecord();
      this.notifications.success(this.tProjectRemoved);
      this.currentGithubRepo = null;
      this.showDeleteGHConfirmBox = false;
      this.selectedRepo = null;
      this.selectedThreshold = ENUMS.THRESHOLD.LOW;
    } catch (err) {
      this.notifications.error(err.errors[0].detail);
      this.showDeleteGHConfirmBox = false;
    }
  })
  deleteRepo;
}
