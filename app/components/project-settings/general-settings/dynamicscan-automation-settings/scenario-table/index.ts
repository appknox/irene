import Component from '@glimmer/component';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import ProjectModel from 'irene/models/project';

export interface ProjectSettingsGeneralSettingsDynamicscanAutomationScenarioTableSignature {
  Args: {
    project?: ProjectModel | null;
    scenarioList: ScanParameterGroupModel[];
    loadingScenarioList: boolean;
    reloadScenarioList(): void;
  };
}

export default class ProjectSettingsGeneralSettingsDynamicscanAutomationScenarioTableComponent extends Component<ProjectSettingsGeneralSettingsDynamicscanAutomationScenarioTableSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;

  get columns() {
    return [
      {
        name: this.intl.t('scenario'),
        valuePath: 'name',
        width: 200,
      },
      {
        headerComponent:
          'project-settings/general-settings/dynamicscan-automation-settings/scenario-table/status-header',
        cellComponent:
          'project-settings/general-settings/dynamicscan-automation-settings/scenario-table/status',
        width: 100,
        textAlign: 'right',
      },
    ];
  }

  @action onScenarioClick({
    rowValue: scenario,
  }: {
    rowValue: ScanParameterGroupModel;
  }) {
    this.router.transitionTo(
      'authenticated.dashboard.project.settings.dast-automation-scenario',
      scenario.id
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::ScenarioTable': typeof ProjectSettingsGeneralSettingsDynamicscanAutomationScenarioTableComponent;
  }
}
