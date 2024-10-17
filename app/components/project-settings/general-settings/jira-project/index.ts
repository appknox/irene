// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import { waitForPromise } from '@ember/test-waiters';

import ENUMS from 'irene/enums';
import ProjectModel from 'irene/models/project';
import JiraRepoModel from 'irene/models/jira-repo';
import OrganizationJiraProjectModel from 'irene/models/organization-jiraproject';
import parseError from 'irene/utils/parse-error';

type JiraProjectsQueryResponse =
  DS.AdapterPopulatedRecordArray<OrganizationJiraProjectModel> & {
    meta: { count: number };
  };

interface JiraSelectedRepoProps {
  key: string;
  name: string;
}

export interface ProjectSettingsGeneralSettingsJiraProjectSignature {
  Args: {
    project?: ProjectModel | null;
  };
}

export default class ProjectSettingsGeneralSettingsJiraProjectComponent extends Component<ProjectSettingsGeneralSettingsJiraProjectSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked jiraProjectsResponse: JiraProjectsQueryResponse | null = null;
  @tracked noIntegration = false;
  @tracked reconnect = false;
  @tracked noAccess = false;
  @tracked currentJiraProject: JiraRepoModel | null = null;
  @tracked selectedRepo: JiraSelectedRepoProps | null = null;
  @tracked showEditJiraModal = false;
  @tracked showDeleteJIRAConfirmBox = false;
  @tracked selectedThreshold = ENUMS.THRESHOLD.LOW;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsJiraProjectSignature['Args']
  ) {
    super(owner, args);
    this.initializeJIRARepo();
  }

  get tIntegratedJIRA() {
    return this.intl.t('integratedJIRA');
  }

  get tProjectUpdated() {
    return this.intl.t('projectUpdated');
  }

  get tProjectRemoved() {
    return this.intl.t('projectRemoved');
  }

  get tRepoNotIntegrated() {
    return this.intl.t('repoNotIntegrated');
  }

  get tFetchJIRAProjectFailed() {
    return this.intl.t('fetchProjectFailed');
  }

  get tInvalidRepo() {
    return this.intl.t('invalidProject');
  }

  get tInvalidRisk() {
    return this.intl.t('invalidRisk');
  }

  get thresholds() {
    return ENUMS.THRESHOLD.CHOICES.filter((c) => c.key !== 'UNKNOWN').map(
      (c) => c.value
    );
  }

  get jiraProjects() {
    return this.jiraProjectsResponse?.slice() || [];
  }

  get hasJIRAProject() {
    return Number(this.jiraProjectsResponse?.length) > 0;
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

  @action selectRepo(repo: OrganizationJiraProjectModel) {
    this.selectedRepo = {
      key: repo.key,
      name: repo.name,
    } as JiraSelectedRepoProps;
  }

  @action selectThreshold(threshold: number) {
    this.selectedThreshold = threshold;
  }

  setCurrentJiraRepo = task(async () => {
    try {
      const jiraProject = await waitForPromise(
        this.store.findRecord('jira-repo', Number(this.project?.id))
      );

      this.currentJiraProject = jiraProject;

      this.selectedRepo = {
        key: jiraProject.project_key,
        name: jiraProject.project_name,
      };

      this.selectedThreshold = jiraProject.risk_threshold;
    } catch (err) {
      const error = err as AdapterError;

      if (
        error?.errors?.[0]?.detail &&
        error?.errors?.[0].detail === 'JIRA not integrated'
      ) {
        this.noIntegration = true;
        return;
      }
      if (
        error?.errors?.[0]?.detail &&
        error?.errors?.[0].detail === 'JIRA integration failed'
      ) {
        this.reconnect = true;
        return;
      }

      if (
        error?.errors?.[0]?.detail &&
        error?.errors?.[0].detail === 'No connected JIRA project'
      ) {
        return;
      }

      this.notify.error(this.tFetchJIRAProjectFailed);
    }
  });

  fetchJIRAProjects = task(async () => {
    this.noAccess = false;
    this.noIntegration = false;

    try {
      const jiraprojects = (await waitForPromise(
        this.store.query('organization-jiraproject', {})
      )) as JiraProjectsQueryResponse;

      this.jiraProjectsResponse = jiraprojects;
    } catch (err) {
      const error = err as AdapterError;

      if (error?.errors) {
        const status = error.errors[0]?.status;

        if (Number(status) == 403) {
          this.noAccess = true;
          return;
        } else if (Number(status) == 404) {
          this.noIntegration = true;
          return;
        }

        this.notify.error(parseError(err));
      }
    }
  });

  deleteRepo = task(async () => {
    try {
      await waitForPromise(
        (this.currentJiraProject as JiraRepoModel).destroyRecord()
      );

      this.notify.success(this.tProjectRemoved);
      this.showDeleteJIRAConfirmBox = false;
      this.currentJiraProject = null;
      this.selectedRepo = null;
      this.selectedThreshold = ENUMS.THRESHOLD.LOW;
    } catch (err) {
      this.notify.error(parseError(err));
      this.showDeleteJIRAConfirmBox = false;
    }
  });

  selectProject = task(async () => {
    let jiraProject = this.currentJiraProject;

    const projectDetails = {
      project_key: this.selectedRepo?.key,
      project_name: this.selectedRepo?.name,
      risk_threshold: this.selectedThreshold,
    };

    const successMsg = jiraProject
      ? this.tProjectUpdated
      : this.tIntegratedJIRA;

    if (jiraProject) {
      jiraProject.setProperties(projectDetails);
    } else {
      jiraProject = this.store.createRecord('jira-repo', {
        id: this.project?.id,
        project: this.project,
        ...projectDetails,
      });
    }

    try {
      await waitForPromise((jiraProject as JiraRepoModel).save());
      this.currentJiraProject = jiraProject;
      this.showEditJiraModal = false;

      this.notify.success(successMsg);
    } catch (err) {
      jiraProject?.rollbackAttributes();

      if (jiraProject?.get('dirtyType') === 'deleted') {
        jiraProject?.unloadRecord();
      }

      const error = err as any;

      if (
        error.errors?.[0]?.source?.pointer === '/data/attributes/project_key'
      ) {
        this.notify.error(this.tInvalidRepo);
        return;
      }

      if (
        error.errors[0]?.source?.pointer === '/data/attributes/risk_threshold'
      ) {
        this.notify.error(this.tInvalidRisk);
        return;
      }

      if (error?.errors?.[0]?.detail === 'JIRA not integrated') {
        this.showEditJiraModal = false;
        this.jiraProjectsResponse = null;
        this.noIntegration = true;
        this.currentJiraProject = null;
      }

      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::JiraProject': typeof ProjectSettingsGeneralSettingsJiraProjectComponent;
  }
}
