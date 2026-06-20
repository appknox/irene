import type { AkIconVariantType } from 'ak-icons';
import { ScenarioStepAction } from 'irene/models/scenario-step';

// ─── Types ───────────────────────────────────────────────────────────────────
export type StepValueKind =
  | 'count' // tap: times (1–20)
  | 'text' // select: option label
  | 'secure-text' // enter_text: value, lockable via is_secure
  | 'boolean' // check: checked
  | 'duration' // wait, long_press: number + unit (ms/s/m)
  | 'direction'; // swipe, drag: up/down/left/right

export type StepActionLabelKey =
  | 'dastAutomation.stepActions.tap'
  | 'dastAutomation.stepActions.select'
  | 'dastAutomation.stepActions.enterInput'
  | 'dastAutomation.stepActions.check'
  | 'dastAutomation.stepActions.wait'
  | 'dastAutomation.stepActions.longPress'
  | 'dastAutomation.stepActions.swipe'
  | 'dastAutomation.stepActions.drag';

export type StepPlaceholderKey =
  | 'dastAutomation.stepPlaceholders.count'
  | 'dastAutomation.stepPlaceholders.text'
  | 'dastAutomation.stepPlaceholders.select'
  | 'dastAutomation.stepPlaceholders.enterValue';

export type DirectionLabelKey =
  | 'dastAutomation.directions.up'
  | 'dastAutomation.directions.down'
  | 'dastAutomation.directions.left'
  | 'dastAutomation.directions.right';

export type CheckLabelKey =
  | 'dastAutomation.checkOptions.checked'
  | 'dastAutomation.checkOptions.unchecked';

export interface StepActionConfig {
  action: ScenarioStepAction;
  label: StepActionLabelKey;
  icon: AkIconVariantType;
  valueKind: StepValueKind;
  valuePlaceholder: StepPlaceholderKey;
  unitOptions?: string[];
}

export interface DirectionOption {
  label: DirectionLabelKey;
  value: string;
}

export interface CheckOption {
  label: CheckLabelKey;
  value: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────
export const STEP_ACTION_CONFIGS: StepActionConfig[] = [
  {
    action: ScenarioStepAction.TAP,
    label: 'dastAutomation.stepActions.tap',
    icon: 'touch-app',
    valueKind: 'count',
    valuePlaceholder: 'dastAutomation.stepPlaceholders.count',
  },
  {
    action: ScenarioStepAction.SELECT,
    label: 'dastAutomation.stepActions.select',
    icon: 'arrow-selector-tool',
    valueKind: 'text',
    valuePlaceholder: 'dastAutomation.stepPlaceholders.text',
  },
  {
    action: ScenarioStepAction.ENTER_TEXT,
    label: 'dastAutomation.stepActions.enterInput',
    icon: 'format-size',
    valueKind: 'secure-text',
    valuePlaceholder: 'dastAutomation.stepPlaceholders.text',
  },
  {
    action: ScenarioStepAction.CHECK,
    label: 'dastAutomation.stepActions.check',
    icon: 'verified',
    valueKind: 'boolean',
    valuePlaceholder: 'dastAutomation.stepPlaceholders.select',
  },
  {
    action: ScenarioStepAction.WAIT,
    label: 'dastAutomation.stepActions.wait',
    icon: 'hourglass-pause',
    valueKind: 'duration',
    valuePlaceholder: 'dastAutomation.stepPlaceholders.count',
    unitOptions: ['seconds'],
  },
  {
    action: ScenarioStepAction.LONG_PRESS,
    label: 'dastAutomation.stepActions.longPress',
    icon: 'touch-long',
    valueKind: 'duration',
    valuePlaceholder: 'dastAutomation.stepPlaceholders.count',
    unitOptions: ['milliseconds'],
  },
  {
    action: ScenarioStepAction.SWIPE,
    label: 'dastAutomation.stepActions.swipe',
    icon: 'swipe',
    valueKind: 'direction',
    valuePlaceholder: 'dastAutomation.stepPlaceholders.select',
  },
  {
    action: ScenarioStepAction.DRAG,
    label: 'dastAutomation.stepActions.drag',
    icon: 'drag-pan',
    valueKind: 'direction',
    valuePlaceholder: 'dastAutomation.stepPlaceholders.select',
  },
];

// ─── Option Constants ────────────────────────────────────────────────────────

export const DIRECTION_OPTIONS: DirectionOption[] = [
  { label: 'dastAutomation.directions.up', value: 'up' },
  { label: 'dastAutomation.directions.down', value: 'down' },
  { label: 'dastAutomation.directions.left', value: 'left' },
  { label: 'dastAutomation.directions.right', value: 'right' },
];

export const CHECK_OPTIONS: CheckOption[] = [
  { label: 'dastAutomation.checkOptions.checked', value: 'true' },
  { label: 'dastAutomation.checkOptions.unchecked', value: 'false' },
];

// ─── Utility Functions ────────────────────────────────────────────────────────

export function configForAction(
  action: ScenarioStepAction | null
): StepActionConfig | undefined {
  return STEP_ACTION_CONFIGS.find((config) => config.action === action);
}
