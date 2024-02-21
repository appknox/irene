import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import { waitForPromise } from '@ember/test-waiters';

import ENUMS from 'irene/enums';
import OrganizationService from 'irene/services/organization';
import ProjectModel from 'irene/models/project';
import GithubRepoModel, { GithubRepoDetails } from 'irene/models/github-repo';
import parseError from 'irene/utils/parse-error';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

export interface ProjectSettingsGeneralSettingsGithubProjectSignature {
  Args: {
    project?: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsGithubProjectComponent extends Component<ProjectSettingsGeneralSettingsGithubProjectSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare ajax: any;
  @service declare organization: OrganizationService;

  @tracked currentGithubRepo: GithubRepoModel | null = null;
  @tracked selectedRepo: GithubRepoDetails | null = null;
  @tracked githubRepos: GithubRepoDetails[] = [];
  @tracked reconnect = false;
  @tracked showDeleteGHConfirmBox = false;
  @tracked showEditGithubModal = false;
  @tracked selectedThreshold = ENUMS.THRESHOLD.LOW;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsGithubProjectSignature['Args']
  ) {
    super(owner, args);
    this.fetchdata();
  }

  get tProjectRemoved() {
    return this.intl.t('projectRemoved');
  }

  get tProjectUpdated() {
    return this.intl.t('projectUpdated');
  }

  get tFailedGitHubProject() {
    return this.intl.t('failedGitHubProject');
  }

  get tRepoIntegrated() {
    return this.intl.t('repoIntegrated');
  }

  get tInvalidProject() {
    return this.intl.t('invalidProject');
  }

  get tInvalidRisk() {
    return this.intl.t('invalidRisk');
  }

  get githubReposEndpoint() {
    const org_id = this.organization?.selected?.id;
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

  get thresholdLabelClass() {
    return analysisRiskStatus([
      this.currentGithubRepo?.riskThreshold,
      ENUMS.ANALYSIS.COMPLETED,
      false,
    ]).cssclass;
  }

  get isLoadingRepos() {
    return (
      this.fetchGithubRepos.isRunning || this.setCurrentGithubRepo.isRunning
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
  selectRepo(repo: GithubRepoDetails) {
    this.selectedRepo = repo;
  }

  @action
  selectThreshold(threshold: number) {
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

  setCurrentGithubRepo = task(async () => {
    try {
      const githubrepo = await waitForPromise(
        this.store.findRecord('github-repo', Number(this.project?.id))
      );

      this.currentGithubRepo = githubrepo;
      this.selectedRepo = this.currentGithubRepo.repoDetails;
      this.selectedThreshold = this.currentGithubRepo.riskThreshold;
    } catch (e) {
      const err = e as AdapterError;

      if (
        err?.errors?.[0]?.detail &&
        err.errors[0].detail === 'Github not integrated'
      ) {
        this.currentGithubRepo = null;
        return;
      }
      if (
        err?.errors?.[0]?.detail &&
        err.errors[0].detail === 'Github integration failed'
      ) {
        this.reconnect = true;
        return;
      }
      if (
        err?.errors?.[0]?.detail &&
        err.errors[0].detail === 'No connected repository'
      ) {
        return;
      }

      this.notify.error(this.tFailedGitHubProject);
    }
  });

  fetchGithubRepos = task(async () => {
    try {
      const repos = (await waitForPromise(
        this.ajax.request(this.githubReposEndpoint)
      )) as {
        results: GithubRepoDetails[];
      };

      this.githubRepos = repos.results;
    } catch (err) {
      const error = err as AdapterError;

      if (
        'status' in error &&
        error.status === 400 &&
        error.payload.detail === 'Github integration failed'
      ) {
        this.reconnect = true;
        return;
      }

      if (
        'status' in error &&
        error.status === 404 &&
        error.payload.detail === 'Github not integrated'
      ) {
        this.githubRepos = [];
        return;
      }

      this.notify.error(parseError(error));
    }
  });

  selectProject = task(async () => {
    let githubRepo = this.currentGithubRepo;
    const successMsg = githubRepo ? this.tProjectUpdated : this.tRepoIntegrated;

    if (!githubRepo) {
      githubRepo = this.store.createRecord('github-repo', {
        project: this.project,
      });
    }

    githubRepo.account = String(this.selectedRepo?.owner.login || '');
    githubRepo.repo = String(this.selectedRepo?.name || '');
    githubRepo.riskThreshold = this.selectedThreshold;

    try {
      const currentGithubRepo = await waitForPromise(githubRepo.save());

      this.currentGithubRepo = currentGithubRepo;
      this.notify.success(successMsg);
      this.showEditGithubModal = false;
    } catch (e) {
      githubRepo.rollbackAttributes();

      if (githubRepo.get('dirtyType') === 'deleted') {
        githubRepo.unloadRecord();
      }

      const err = e as any;

      if (
        err?.errors?.[0]?.source?.pointer === '/data/attributes/account' &&
        err?.errors?.[1]?.source?.pointer === '/data/attributes/repo'
      ) {
        this.notify.error(this.tInvalidProject);
        return;
      }
      if (
        err.errors[0]?.source?.pointer === '/data/attributes/risk_threshold' ||
        err.errors[0]?.source?.pointer === '/data/attributes/riskThreshold'
      ) {
        this.notify.error(this.tInvalidRisk);
        return;
      }

      if (err?.errors?.[0]?.detail === 'Github not integrated') {
        this.showEditGithubModal = false;
        this.githubRepos = [];
        this.currentGithubRepo = null;
      }

      this.notify.error(parseError(err));
    }
  });

  deleteRepo = task(async () => {
    try {
      await waitForPromise(
        (this.currentGithubRepo as GithubRepoModel).destroyRecord()
      );

      this.notify.success(this.tProjectRemoved);
      this.currentGithubRepo = null;
      this.showDeleteGHConfirmBox = false;
      this.selectedRepo = null;
      this.selectedThreshold = ENUMS.THRESHOLD.LOW;
    } catch (err) {
      this.notify.error(parseError(err));
      this.showDeleteGHConfirmBox = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::GithubProject': typeof ProjectSettingsGeneralSettingsGithubProjectComponent;
  }
}
