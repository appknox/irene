/* eslint-disable ember/use-ember-data-rfc-395-imports */
import DS from 'ember-data';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';

import ProjectModel from 'irene/models/project';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import ScanParameterGroupModel from 'irene/models/scan-parameter-group';

type ProjectScanParameterGroupArrayResponse =
  DS.AdapterPopulatedRecordArray<ScanParameterGroupModel> & {
    meta: { count: number };
  };

export interface ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsScenarioSignature {
  Args: {
    project?: ProjectModel | null;
    profileId?: string | number;
  };
}

export default class ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsScenarioComponent extends Component<ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsScenarioSignature> {
  @service declare ajax: any;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked showAddScenarioModal = false;
  @tracked scenarioName = '';
  @tracked scenarioStatus = false;
  @tracked projectScenarios: ProjectScanParameterGroupArrayResponse | null =
    null;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsScenarioSignature['Args']
  ) {
    super(owner, args);
    this.fetchProjectScenarios.perform();
  }

  get disableScenarioAddBtn() {
    return !this.scenarioName;
  }

  get scenarioList() {
    return this.projectScenarios?.toArray() || [];
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
      this.notify.error('Please enter a scenario name');
      return;
    }

    const namespace = ENV.namespace_v2;
    const scanParamGroupUrl = [
      ENV.endpoints['projects'],
      this.args.project?.id,
      ENV.endpoints['scanParameterGroups'],
    ].join('/');

    try {
      const scenario = (await this.ajax.post(scanParamGroupUrl, {
        namespace,
        data: { name: this.scenarioName },
      })) as ScanParameterGroupModel;

      if (this.scenarioStatus) {
        await this.ajax.put(`${scanParamGroupUrl}/${scenario.id}`, {
          namespace,
          data: {
            name: scenario.name,
            is_active: this.scenarioStatus,
          },
        });
      }

      this.scenarioName = '';
      this.scenarioStatus = false;

      this.closeAddScenarioModal();
      this.reloadProjectScenarios();
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  fetchProjectScenarios = task(async () => {
    try {
      this.projectScenarios = (await this.store.query('scan-parameter-group', {
        projectId: this.args.project?.id,
      })) as ProjectScanParameterGroupArrayResponse;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::Scenario': typeof ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsScenarioComponent;
  }
}
