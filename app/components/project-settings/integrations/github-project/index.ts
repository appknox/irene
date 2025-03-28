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
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

export interface ProjectSettingsIntegrationsGithubProjectSignature {
  Args: {
    project?: ProjectModel | null;
  };
}

export default class ProjectSettingsIntegrationsGithubProjectComponent extends Component<ProjectSettingsIntegrationsGithubProjectSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;

  @tracked currentGithubRepo: GithubRepoModel | null = null;
  @tracked selectedRepo: GithubRepoDetails | null = null;
  @tracked githubRepos: GithubRepoDetails[] = [];

  @tracked noIntegration = false;
  @tracked reconnect = false;

  @tracked showDeleteGHConfirmBox = false;
  @tracked showEditGithubModal = false;
  @tracked selectedThreshold = ENUMS.THRESHOLD.LOW;

  constructor(
    owner: unknown,
    args: ProjectSettingsIntegrationsGithubProjectSignature['Args']
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

  get showHeaderActions() {
    return !!this.currentGithubRepo;
  }

  get headerSubText() {
    if (this.reconnect || this.noIntegration) {
      return '';
    }

    if (this.currentGithubRepo?.account) {
      return this.intl.t('integratedGithub');
    }

    if (this.hasGitHubProject) {
      return this.intl.t('otherTemplates.selectGHRepo');
    }

    return '';
  }

  get noIntegrationOrNoRepoSubtext() {
    if (this.reconnect) {
      return `${this.intl.t('github')} ${this.intl.t('reconnectGotoSettings')}`;
    }

    if (this.noIntegration) {
      return `${this.intl.t('github')} ${this.intl.t('gotoSettings')}`;
    }

    return this.intl.t('githubNoProject');
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
    return this.githubRepos.length > 0;
  }

  get hasNoGithubProjects() {
    return this.githubRepos.length === 0;
  }

  get thresholds() {
    return ENUMS.THRESHOLD.CHOICES.filter((c) => c.key !== 'UNKNOWN').map(
      (c) => c.value
    );
  }

  get isLoadingRepos() {
    return (
      this.fetchGithubRepos.isRunning || this.setCurrentGithubRepo.isRunning
    );
  }

  get showSelectPrjCTA() {
    return this.hasGitHubProject && !(this.reconnect || this.noIntegration);
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
      const errorDetail = err?.errors?.[0]?.detail;

      // If Repos exist and error is not integrated, then something went wrong with the integration
      if (errorDetail === 'Github not integrated' && this.hasGitHubProject) {
        this.currentGithubRepo = null;
        this.reconnect = true;

        return;
      }

      if (errorDetail === 'Github not integrated') {
        this.currentGithubRepo = null;

        return;
      }

      if (errorDetail === 'Github integration failed') {
        this.reconnect = true;

        return;
      }

      if (errorDetail === 'No connected repository') {
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
      const error = err as AjaxError;
      const errorStatus = error?.status;
      const errorDetail = error.payload.detail;

      if (errorStatus === 400 && errorDetail === 'Github integration failed') {
        this.reconnect = true;

        return;
      }

      if (errorStatus === 404 && errorDetail === 'Github not integrated') {
        this.noIntegration = true;
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
      this.showEditGithubModal = false;

      this.notify.success(successMsg);
    } catch (e) {
      githubRepo.rollbackAttributes();

      if (githubRepo.get('dirtyType') === 'deleted') {
        githubRepo.unloadRecord();
      }

      const err = e as AdapterError;
      const errorPointer1 = err?.errors?.[0]?.source?.pointer;
      const errorPointer2 = err?.errors?.[1]?.source?.pointer;
      const errorDetail = err?.errors?.[0]?.detail;

      if (
        errorPointer1 === '/data/attributes/account' &&
        errorPointer2 === '/data/attributes/repo'
      ) {
        this.notify.error(this.tInvalidProject);

        return;
      }

      if (
        errorPointer1 === '/data/attributes/risk_threshold' ||
        errorPointer1 === '/data/attributes/riskThreshold'
      ) {
        this.notify.error(this.tInvalidRisk);

        return;
      }

      if (errorDetail === 'Github not integrated') {
        this.showEditGithubModal = false;
        this.currentGithubRepo = null;
        this.noIntegration = true;

        this.githubRepos = [];
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
    'ProjectSettings::Integrations::GithubProject': typeof ProjectSettingsIntegrationsGithubProjectComponent;
  }
}
