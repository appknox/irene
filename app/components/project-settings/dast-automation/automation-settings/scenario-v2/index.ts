import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

/* eslint-disable ember/use-ember-data-rfc-395-imports */
import type DS from 'ember-data';

import parseError from 'irene/utils/parse-error';
import type ProjectModel from 'irene/models/project';
import type ScenarioModel from 'irene/models/scenario';

import styles from './index.scss';

type ProjectScenariosArrayResponse =
  DS.AdapterPopulatedRecordArray<ScenarioModel>;

export interface ProjectSettingsDastAutomationAutomationSettingsScenarioV2Signature {
  Args: {
    project?: ProjectModel | null;
    profileId?: string | number;
    isAiDastEnabled?: boolean;
  };
}

export default class ProjectSettingsDastAutomationAutomationSettingsScenarioV2Component extends Component<ProjectSettingsDastAutomationAutomationSettingsScenarioV2Signature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked showAddScenarioModal = false;
  @tracked scenarioName = '';
  @tracked scenarioStatus = false;
  @tracked projectScenarios: ProjectScenariosArrayResponse | null = null;

  constructor(
    owner: unknown,
    args: ProjectSettingsDastAutomationAutomationSettingsScenarioV2Signature['Args']
  ) {
    super(owner, args);

    this.fetchProjectScenarios.perform();
  }

  get scenarioNameFormControlClass() {
    return styles['scenario-name-form-control'];
  }

  get disableScenarioAddBtn() {
    return !this.scenarioName;
  }

  get scenarioList() {
    return this.projectScenarios?.slice() ?? [];
  }

  @action reloadProjectScenarios() {
    this.fetchProjectScenarios.perform();
  }

  @action createScenario() {
    this.addScenarioToProject.perform();
  }

  @action closeAddScenarioModal() {
    this.showAddScenarioModal = false;
  }

  @action toggleScenarioStatus(_: Event, checked?: boolean) {
    this.scenarioStatus = !!checked;
  }

  @action openAddScenarioModal() {
    this.showAddScenarioModal = true;
  }

  @action handleScenarioNameChange(event: Event) {
    this.scenarioName = (event.target as HTMLInputElement).value;
  }

  addScenarioToProject = task(async () => {
    if (!this.scenarioName) {
      this.notify.error(this.intl.t('dastAutomation.enterScenarioName'));

      return;
    }

    try {
      const scenario = this.store.createRecord('scenario', {
        name: this.scenarioName,
        description: '',
        isActive: this.scenarioStatus,
      });

      const adapterOptions = { projectId: this.args.project?.id };
      await waitForPromise(scenario.save({ adapterOptions }));

      this.notify.success(this.intl.t('dastAutomation.scenarioAdded'));

      this.scenarioName = '';
      this.scenarioStatus = false;

      this.closeAddScenarioModal();
      this.reloadProjectScenarios();
    } catch (error) {
      const err = error as AdapterError;

      if (err?.errors?.[0]?.source?.pointer === '/data/attributes/name') {
        const errorMessage =
          err?.errors?.[0]?.detail ?? this.intl.t('somethingWentWrong');

        this.notify.error(errorMessage);

        return;
      }

      this.notify.error(parseError(error));
    }
  });

  fetchProjectScenarios = task(async () => {
    try {
      const result = (await this.store.query('scenario', {
        projectId: this.args.project?.id,
      })) as ProjectScenariosArrayResponse;

      this.projectScenarios = result;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings::ScenarioV2': typeof ProjectSettingsDastAutomationAutomationSettingsScenarioV2Component;
  }
}
