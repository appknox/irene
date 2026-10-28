import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import { MAX_LOGIN_ROLES } from '../index';
import {
  isAutoOtpIdentifier,
  otpIdentifierFor,
  type StepActionConfig,
} from './step-actions';
import type { StepValidationError } from './step-validation';

import { ScenarioStepAction } from 'irene/models/scenario-step';

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
  @service declare intl: IntlService;

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

  get isNewUserRoleDisabled() {
    return !this.args.canAddRole || Boolean(this.args.isReadOnly);
  }

  // Explains why the "New User Role" button is disabled, shown in a tooltip.
  get newUserRoleDisabledReason() {
    if (this.args.isReadOnly) {
      return this.intl.t('dastAutomation.addUserRoleDisabledReadOnly');
    }

    if (!this.args.canAddRole) {
      return this.intl.t('dastAutomation.maxUserRolesReached', {
        maxRoles: MAX_LOGIN_ROLES,
      });
    }

    return '';
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

  /** Identifier for an Enter OTP step, unique among this list's other Enter OTP steps. */
  otpIdentifier(step?: ScenarioStepModel) {
    const taken = this.steps
      .filter((s) => s !== step && s.action === ScenarioStepAction.ENTER_OTP)
      .map((s) => s.identifier);

    return otpIdentifierFor(taken);
  }

  @action
  addStep(config: StepActionConfig) {
    const isOtp = config.action === ScenarioStepAction.ENTER_OTP;

    const step = this.store.createRecord('scenario-step', {
      order: this.steps.length + 1,
      action: config.action,
      identifier: isOtp ? this.otpIdentifier() : '',
      value: config.defaultValue ?? '',
      isSecure: false,
      metadata: { ...config.defaultMetadata },
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

    const wasOtp = step.action === ScenarioStepAction.ENTER_OTP;

    step.action = config.action;

    // Enter OTP names its code field itself; leaving it drops only that auto
    // name, so a saved custom identifier (e.g. "Authenticator code") is kept.
    if (config.action === ScenarioStepAction.ENTER_OTP) {
      step.identifier = this.otpIdentifier(step);
    } else if (!wasOtp || isAutoOtpIdentifier(step.identifier)) {
      step.identifier = '';
    }

    step.value = config.defaultValue ?? '';
    step.isSecure = false;
    step.metadata = { ...config.defaultMetadata };

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
