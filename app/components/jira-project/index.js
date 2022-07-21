import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENUMS from 'irene/enums';

export default class JiraProjectComponent extends Component {
  @service intl;
  @service ajax;
  @service notifications;
  @service store;

  @tracked jiraProjects = null;
  @tracked noIntegration = false;
  @tracked noAccess = false;
  @tracked currentJiraProject = null;
  @tracked selectedRepo = null;
  @tracked showEditJiraModal = false;
  @tracked showDeleteJIRAConfirmBox = false;
  @tracked selectedThreshold = ENUMS.THRESHOLD.LOW;

  tIntegratedJIRA = this.intl.t('integratedJIRA');
  tProjectRemoved = this.intl.t('projectRemoved');
  tRepoNotIntegrated = this.intl.t('repoNotIntegrated');
  tFetchJIRAProjectFailed = this.intl.t('fetchProjectFailed');
  tInvalidRepo = this.intl.t('invalidProject');
  tInvalidRisk = this.intl.t('tInvalidRisk');

  constructor() {
    super(...arguments);
    this.initializeJIRARepo();
  }

  get thresholds() {
    return ENUMS.THRESHOLD.CHOICES.filter((c) => c.key !== 'UNKNOWN').map(
      (c) => c.value
    );
  }

  get hasJIRAProject() {
    return this.jiraProjects?.length > 0;
  }

  get project() {
    return this.args.project;
  }

  @action initializeJIRARepo() {
    this.fetchJIRAProjects.perform();
    this.setCurrentJiraRepo.perform();
  }

  @action openDeleteJIRAConfirmBox() {
    this.showDeleteJIRAConfirmBox = true;
  }

  @action
  confirmCallback() {
    this.deleteRepo.perform();
  }

  @action editJiraRepoModal() {
    this.showEditJiraModal = true;
  }

  @action closeJiraRepoModal() {
    this.showEditJiraModal = false;
  }

  @action selectRepo(repo) {
    this.selectedRepo = repo.toJSON();
  }

  @action selectThreshold(threshold) {
    this.selectedThreshold = threshold;
  }

  @task(function* () {
    try {
      const jiraProject = yield this.store.findRecord(
        'jira-repo',
        this.project.id
      );

      this.currentJiraProject = jiraProject;
      this.selectedRepo = {
        key: jiraProject.project_key,
        name: jiraProject.project_name,
      };
    } catch (error) {
      if (
        error?.errors?.[0].detail &&
        error?.errors?.[0].detail === 'JIRA not integrated'
      ) {
        this.noIntegration = true;
        return;
      }
      if (
        error?.errors?.[0].detail &&
        error?.errors?.[0].detail === 'JIRA integration failed'
      ) {
        this.reconnect = true;
        return;
      }

      if (
        error?.errors?.[0].detail &&
        error?.errors?.[0].detail === 'No connected JIRA project'
      ) {
        return;
      }

      this.notifications.error(this.tFetchJIRAProjectFailed);
    }
  })
  setCurrentJiraRepo;

  @task(function* () {
    this.noAccess = false;
    this.noIntegration = false;

    try {
      const jiraprojects = yield this.store.query(
        'organizationJiraproject',
        {}
      );

      this.jiraProjects = jiraprojects;
    } catch (error) {
      if (error.errors) {
        const status = error.errors[0].status;
        if (status == 403) {
          this.noAccess = true;
          return;
        } else if (status == 404) {
          this.noIntegration = true;
          return;
        }
        throw error;
      }
    }
  })
  fetchJIRAProjects;

  @task(function* () {
    try {
      yield this.currentJiraProject.destroyRecord();
      this.currentJiraProject.unloadRecord();

      this.notifications.success(this.tProjectRemoved);
      this.showDeleteJIRAConfirmBox = false;
      this.currentJiraProject = null;
      this.selectedRepo = null;
      this.selectedThreshold = 1;
    } catch (err) {
      this.notifications.error(err.payload?.message);
      this.showDeleteJIRAConfirmBox = false;
    }
  })
  deleteRepo;

  @task(function* () {
    let jiraProject = this.currentJiraProject;

    if (jiraProject) {
      jiraProject.setProperties({
        project_key: this.selectedRepo.key,
        project_name: this.selectedRepo.name,
        risk_threshold: this.selectedThreshold,
      });
    } else {
      jiraProject = this.store.createRecord('jira-repo', {
        id: this.project.id,
        project: this.project,
        project_key: this.selectedRepo?.key,
        project_name: this.selectedRepo?.name,
        risk_threshold: this.selectedThreshold,
      });
    }

    try {
      yield jiraProject?.save();
      this.currentJiraProject = jiraProject;
      this.showEditJiraModal = false;
      this.notifications.success(this.tIntegratedJIRA);
    } catch (error) {
      yield jiraProject?.rollbackAttributes();

      if (jiraProject?.dirtyType === 'deleted') {
        yield jiraProject?.unloadRecord();
      }

      if (error.errors[0]?.source?.pointer === '/data/attributes/project_key') {
        this.notifications.error(this.tInvalidRepo);
        return;
      }

      if (
        error.errors[0]?.source?.pointer === '/data/attributes/risk_threshold'
      ) {
        this.notifications.error(this.tInvalidRisk);
        return;
      }

      if (error?.errors?.[0]?.detail === 'JIRA not integrated') {
        this.showEditJiraModal = false;
        this.jiraProjects = null;
        this.noIntegration = true;
        this.currentJiraProject = null;
      }
      this.notifications.error(error?.errors?.[0]?.detail);
    }
  })
  selectProject;
}
