import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

/* eslint-disable ember/use-ember-data-rfc-395-imports */
import type DS from 'ember-data';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type ProjectModel from 'irene/models/project';
import type ScanParameterGroupModel from 'irene/models/scan-parameter-group';

import styles from './index.scss';

type ProjectScenariosArrayResponse =
  DS.AdapterPopulatedRecordArray<ScanParameterGroupModel>;

export interface ProjectSettingsDastAutomationAutomationSettingsScenarioSignature {
  Args: {
    project?: ProjectModel | null;
    profileId?: string | number;
  };
}

export default class ProjectSettingsDastAutomationAutomationSettingsScenarioComponent extends Component<ProjectSettingsDastAutomationAutomationSettingsScenarioSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked showAddScenarioModal = false;
  @tracked scenarioName = '';
  @tracked scenarioStatus = false;
  @tracked projectScenarios: ProjectScenariosArrayResponse | null = null;

  namespace = ENV.namespace_v2;

  constructor(
    owner: unknown,
    args: ProjectSettingsDastAutomationAutomationSettingsScenarioSignature['Args']
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
    return this.projectScenarios?.slice() || [];
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

  @action
  handleScenarioNameChange(event: Event) {
    this.scenarioName = (event.target as HTMLInputElement).value;
  }

  addScenarioToProject = task(async () => {
    if (!this.scenarioName) {
      this.notify.error(this.intl.t('dastAutomation.enterScenarioName'));

      return;
    }

    try {
      const scenario = this.store.createRecord('scan-parameter-group', {
        name: this.scenarioName,
        description: '',
      });

      const adapterOptions = { projectId: this.args.project?.id };
      await waitForPromise(scenario.save({ adapterOptions }));

      if (this.scenarioStatus) {
        scenario.set('isActive', this.scenarioStatus);
        await waitForPromise(scenario.save({ adapterOptions }));
      }

      this.notify.success(this.intl.t('dastAutomation.scenarioAdded'));

      this.scenarioName = '';
      this.scenarioStatus = false;

      this.closeAddScenarioModal();
      this.reloadProjectScenarios();
    } catch (error) {
      const errors = error as any;

      if (errors?.errors?.[0]?.source?.pointer === '/data/attributes/name') {
        this.notify.error(errors?.errors?.[0]?.detail);

        return;
      }

      this.notify.error(parseError(error));
    }
  });

  fetchProjectScenarios = task(async () => {
    try {
      this.projectScenarios = (await this.store.query('scan-parameter-group', {
        projectId: this.args.project?.id,
      })) as ProjectScenariosArrayResponse;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings::Scenario': typeof ProjectSettingsDastAutomationAutomationSettingsScenarioComponent;
  }
}
