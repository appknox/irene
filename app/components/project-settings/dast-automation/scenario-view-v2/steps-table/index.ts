import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';

import { type StepActionConfig } from './step-actions';
import type { StepValidationError } from './step-validation';

import type ScenarioUserRoleModel from 'irene/models/scenario-user-role';
import type ScenarioStepModel from 'irene/models/scenario-step';
import type ScenarioDetailModel from 'irene/models/scenario-detail';

export const MAX_STEPS = 10;

export interface ProjectSettingsDastAutomationScenarioViewV2StepsTableSignature {
  Element: HTMLElement;
  Args: {
    userRole?: ScenarioUserRoleModel;
    steps: ScenarioStepModel[];
    scenarioDetail: ScenarioDetailModel;
    isReadOnly?: boolean;
    isLastRole?: boolean;
    activeSampleIndex?: number;
    stepErrors?: Map<ScenarioStepModel, StepValidationError>;
    canAddRole?: boolean;
    onAddRole?: () => void;
    onDeleteRole?: (role: ScenarioUserRoleModel) => unknown;
    onStepsChange?: (steps: ScenarioStepModel[]) => void;

    clearStepError?: (
      step: ScenarioStepModel,
      field?: 'identifier' | 'value'
    ) => void;
  };
}

export default class ProjectSettingsDastAutomationScenarioViewV2StepsTableComponent extends Component<ProjectSettingsDastAutomationScenarioViewV2StepsTableSignature> {
  @service declare store: Store;

  @tracked addStepsAnchorRef: HTMLElement | null = null;
  @tracked isEditingRoleName = false;
  @tracked editingRoleName = '';
  @tracked showDeleteRoleConfirmBox = false;

  get steps() {
    return this.args.steps;
  }

  get hasMaxSteps() {
    return this.steps.length >= MAX_STEPS;
  }

  get disableAddStep() {
    return this.hasMaxSteps;
  }

  @action
  startEditingRoleName() {
    if (!this.args.userRole) {
      return;
    }

    this.editingRoleName = this.args.userRole.name;
    this.isEditingRoleName = true;
  }

  @action
  cancelRoleNameEdit() {
    this.isEditingRoleName = false;
    this.editingRoleName = '';
  }

  @action
  confirmRoleNameEdit() {
    const trimmed = this.editingRoleName.trim();

    if (trimmed && this.args.userRole) {
      this.args.userRole.name = trimmed;
    }

    this.isEditingRoleName = false;
    this.editingRoleName = '';
  }

  @action
  handleRoleNameInput(event: Event) {
    this.editingRoleName = (event.target as HTMLInputElement).value;
  }

  @action
  handleAddRole() {
    this.args.onAddRole?.();
  }

  @action
  openDeleteRoleConfirmBox() {
    this.showDeleteRoleConfirmBox = true;
  }

  @action
  closeDeleteRoleConfirmBox() {
    this.showDeleteRoleConfirmBox = false;
  }

  @action
  openAddStepsPopover(event: MouseEvent) {
    this.addStepsAnchorRef = event.currentTarget as HTMLElement;
  }

  @action
  closeAddStepsPopover() {
    this.addStepsAnchorRef = null;
  }

  @action
  addStep(config: StepActionConfig) {
    const step = this.store.createRecord('scenario-step', {
      order: this.steps.length + 1,
      action: config.action,
      identifier: '',
      value: '',
      isSecure: false,
      role: this.args.userRole ?? null,
      scenario: this.args.scenarioDetail,
    });

    this.closeAddStepsPopover();
    this.args.onStepsChange?.([...this.steps, step]);
  }

  @action
  deleteStep(step: ScenarioStepModel) {
    if (!this.steps.includes(step)) {
      return;
    }

    const next = this.steps.filter((s) => s !== step);

    this.reassignOrders(next);
    this.args.clearStepError?.(step);
    this.args.onStepsChange?.(next);
  }

  @action
  reorderSteps(reordered: ScenarioStepModel[]) {
    this.reassignOrders(reordered);
    this.args.onStepsChange?.(reordered);
  }

  @action
  changeStepAction(step: ScenarioStepModel, config: StepActionConfig) {
    if (step.action === config.action) {
      return;
    }

    step.action = config.action;
    step.identifier = '';
    step.value = '';
    step.isSecure = false;

    this.args.clearStepError?.(step);
  }

  reassignOrders(steps: ScenarioStepModel[]) {
    steps.forEach((step, index) => {
      step.order = index + 1;
    });
  }

  confirmDeleteRole = task(async () => {
    if (this.args.userRole && this.args.onDeleteRole) {
      await this.args.onDeleteRole(this.args.userRole);
    }

    this.showDeleteRoleConfirmBox = false;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::ScenarioViewV2::StepsTable': typeof ProjectSettingsDastAutomationScenarioViewV2StepsTableComponent;
  }
}
