import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type Store from 'ember-data/store';

import { ScenarioStepAction } from 'irene/models/scenario-step';
import type ScenarioStepModel from 'irene/models/scenario-step';
import type ScenarioUserRoleModel from 'irene/models/scenario-user-role';
import type ScenarioDetailModel from 'irene/models/scenario-detail';

interface ProjectSettingsDastAutomationScenarioViewV2LoginScenarioSampleSignature {
  Args: {
    scenarioDetail: ScenarioDetailModel;
  };
}

interface MockStepSeed {
  action: ScenarioStepAction;
  identifier: string;
  value: string;
  isSecure?: boolean;
}

const MOCK_STEP_SEEDS: MockStepSeed[] = [
  {
    action: ScenarioStepAction.TAP,
    identifier: 'Button Login Start',
    value: '2',
  },
  {
    action: ScenarioStepAction.SELECT,
    identifier: 'Dropdown Region',
    value: 'North America',
  },
  {
    action: ScenarioStepAction.ENTER_TEXT,
    identifier: 'Email ID',
    value: 'user@example.com',
    isSecure: true,
  },
  {
    action: ScenarioStepAction.ENTER_TEXT,
    identifier: 'Password',
    value: 'P@ssword123',
    isSecure: true,
  },
  {
    action: ScenarioStepAction.CHECK,
    identifier: 'Checkbox Terms',
    value: 'true',
  },
  {
    action: ScenarioStepAction.TAP,
    identifier: 'Button Submit',
    value: '1',
  },
  {
    action: ScenarioStepAction.WAIT,
    identifier: 'Loading Spinner',
    value: '5',
  },
];

export default class ProjectSettingsDastAutomationScenarioViewV2LoginScenarioSampleComponent extends Component<ProjectSettingsDastAutomationScenarioViewV2LoginScenarioSampleSignature> {
  @service declare store: Store;

  @tracked showSampleDrawer = false;
  @tracked mockRole: ScenarioUserRoleModel | null = null;
  @tracked mockSteps: ScenarioStepModel[] = [];

  @action openSampleDrawer() {
    this.buildMockData();
    this.showSampleDrawer = true;
  }

  @action closeSampleDrawer() {
    this.showSampleDrawer = false;
    this.clearMockData();
  }

  buildMockData() {
    this.clearMockData();

    const role = this.store.createRecord('scenario-user-role', {
      name: 'Default User Role 1',
    });

    const steps = MOCK_STEP_SEEDS.map((seed, index) =>
      this.store.createRecord('scenario-step', {
        order: index + 1,
        action: seed.action,
        identifier: seed.identifier,
        value: seed.value,
        isSecure: seed.isSecure ?? false,
        role,
        scenario: this.args.scenarioDetail,
      })
    );

    this.mockRole = role;
    this.mockSteps = steps;
  }

  clearMockData() {
    this.mockSteps.forEach((step) => step.unloadRecord());
    this.mockRole?.unloadRecord();
    this.mockSteps = [];
    this.mockRole = null;
  }

  willDestroy() {
    super.willDestroy();
    this.clearMockData();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::ScenarioViewV2::LoginScenarioSample': typeof ProjectSettingsDastAutomationScenarioViewV2LoginScenarioSampleComponent;
  }
}
