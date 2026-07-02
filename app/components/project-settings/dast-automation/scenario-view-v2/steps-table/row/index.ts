import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import {
  STEP_ACTION_CONFIGS,
  CHECK_OPTIONS,
  DIRECTION_OPTIONS,
  configForAction,
  type StepActionConfig,
} from '../step-actions';

import styles from './index.scss';
import type { StepValidationError } from '../step-validation';

import parseError from 'irene/utils/parse-error';
import { ScenarioStepAction } from 'irene/models/scenario-step';
import type { AkDndProviderApi } from 'irene/components/ak-dnd-provider';
import type ScenarioStepModel from 'irene/models/scenario-step';
import type ScenarioDetailModel from 'irene/models/scenario-detail';

export interface ProjectSettingsDastAutomationScenarioViewV2StepsTableRowSignature {
  Element: HTMLElement;
  Args: {
    scenarioDetail: ScenarioDetailModel;
    step: ScenarioStepModel;
    index: number;
    dnd: AkDndProviderApi<ScenarioStepModel>;
    isReadOnly?: boolean;
    isActiveSample?: boolean;
    stepErrors?: Map<ScenarioStepModel, StepValidationError>;
    onActionChange: (step: ScenarioStepModel, config: StepActionConfig) => void;
    onDelete: (step: ScenarioStepModel) => void;

    clearStepError?: (
      step: ScenarioStepModel,
      field?: 'identifier' | 'value'
    ) => void;
  };
}

export default class ProjectSettingsDastAutomationScenarioViewV2StepsTableRowComponent extends Component<ProjectSettingsDastAutomationScenarioViewV2StepsTableRowSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  stepActionConfigs = STEP_ACTION_CONFIGS;
  checkOptions = CHECK_OPTIONS;
  directionOptions = DIRECTION_OPTIONS;

  @tracked rowElement: HTMLElement | null = null;
  @tracked _selectedUnit?: string;

  _secureValueBeforeFocus: string | null = null;

  get step() {
    return this.args.step;
  }

  get actionConfig() {
    return configForAction(this.step.action);
  }

  get isEnterTextAction() {
    return this.step.action === ScenarioStepAction.ENTER_TEXT;
  }

  get valueKind() {
    return this.actionConfig?.valueKind;
  }

  get valuePlaceholder() {
    return (
      this.actionConfig?.valuePlaceholder ??
      'dastAutomation.stepPlaceholders.enterValue'
    );
  }

  get isSecureText() {
    return this.valueKind === 'secure-text';
  }

  get maskDisabled() {
    const stepIsEdited = this.step.get('hasDirtyAttributes');
    const stepIsNew = this.step.get('isNew');

    if (stepIsNew || stepIsEdited) {
      return true;
    }

    return !this.isSecureText || !this.step.id || this.step.isSecure;
  }

  get selectedCheckOption() {
    return this.checkOptions.find((option) => option.value === this.step.value);
  }

  get selectedDirectionOption() {
    const val = (this.step.value ?? '').toLowerCase();

    return this.directionOptions.find((option) => option.value === val);
  }

  get stepError() {
    return this.args.stepErrors?.get(this.step) ?? null;
  }

  get identifierError() {
    return this.stepError?.identifier ?? null;
  }

  get valueError() {
    return this.stepError?.value ?? null;
  }

  get identifierErrorMessage() {
    return this.identifierError ? this.intl.t(this.identifierError) : '';
  }

  get valueErrorMessage() {
    return this.valueError ? this.intl.t(this.valueError) : '';
  }

  get isBeingDragged() {
    return this.args.dnd.draggingIndex === this.args.index;
  }

  get disableDelete() {
    return this.args.dnd.items.length <= 1;
  }

  get isDragTarget() {
    return (
      this.args.dnd.isDragging &&
      !this.isBeingDragged &&
      this.args.dnd.dragOverIndex === this.args.index
    );
  }

  get unitOptions() {
    return this.actionConfig?.unitOptions ?? [];
  }

  get selectedUnit() {
    const options = this.unitOptions;

    if (this._selectedUnit && options.includes(this._selectedUnit)) {
      return this._selectedUnit;
    }

    return options[0] ?? '';
  }

  get classes() {
    return {
      enterInputTrigger: styles['steps-table-enter-input-trigger'],
      compactTrigger: styles['steps-table-compact-trigger'],
    };
  }

  @action
  registerRow(element: HTMLElement) {
    this.rowElement = element;
  }

  @action
  handleUnitSelect(unit: string) {
    this._selectedUnit = unit;
  }

  @action
  toggleStepSecure(step: ScenarioStepModel) {
    if (!this.maskDisabled) {
      this.maskStepTask.perform(step);
    }
  }

  @action
  handleActionSelect(config: StepActionConfig) {
    this.args.onActionChange(this.step, config);
  }

  @action
  handleIdentifierInput(event: Event) {
    this.step.identifier = (event.target as HTMLInputElement).value;
    this.args.clearStepError?.(this.step, 'identifier');
  }

  @action
  handleValueInput(event: Event) {
    this.step.value = (event.target as HTMLInputElement).value;
    this.args.clearStepError?.(this.step, 'value');
  }

  @action
  handleValueFocus(event: FocusEvent) {
    if (this.step.isSecure) {
      const target = event.target as HTMLInputElement;

      this._secureValueBeforeFocus = this.step.value;

      target.value = '';

      this.step.value = '';
      this.step.isSecure = false;

      this.args.clearStepError?.(this.step, 'value');
    }
  }

  @action
  handleValueBlur(event: FocusEvent) {
    if (this._secureValueBeforeFocus === null) {
      return;
    }

    const target = event.target as HTMLInputElement;

    if (target.value === '') {
      this.step.value = this._secureValueBeforeFocus;
      this.step.isSecure = true;
    }

    this._secureValueBeforeFocus = null;
  }

  @action
  handleDragStart(event: DragEvent) {
    if (this.args.isReadOnly) {
      event.preventDefault();

      return;
    }

    if (this.rowElement && event.dataTransfer) {
      const rect = this.rowElement.getBoundingClientRect();

      event.dataTransfer.setDragImage(
        this.rowElement,
        event.clientX - rect.left,
        event.clientY - rect.top
      );
    }

    this.args.dnd.onDragStart(this.args.index, event);
  }

  @action
  handleCheckValueSelect(option: { label: string; value: string }) {
    this.step.value = option.value;
    this.args.clearStepError?.(this.step, 'value');
  }

  @action
  handleDirectionSelect(option: { label: string; value: string }) {
    this.step.value = option.value;
    this.args.clearStepError?.(this.step, 'value');
  }

  maskStepTask = task(async (step: ScenarioStepModel) => {
    try {
      const scenario = this.args.scenarioDetail;
      const project = String(scenario?.get('project')?.get('id'));

      await step.maskStep(project, scenario.id, true);
      this.notify.success(this.intl.t('dastAutomation.stepMaskedSuccessfully'));
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('somethingWentWrong')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::ScenarioViewV2::StepsTable::Row': typeof ProjectSettingsDastAutomationScenarioViewV2StepsTableRowComponent;
  }
}
