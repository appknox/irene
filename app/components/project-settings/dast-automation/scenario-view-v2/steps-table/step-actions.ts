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

export interface StepActionConfig {
  action: ScenarioStepAction;
  label: string;
  icon: AkIconVariantType;
  valueKind: StepValueKind;
  valuePlaceholder: string;
  unitOptions?: string[];
}

// ─── Constants ──────────────────────────────────────────────────────────────
export const STEP_ACTION_CONFIGS: StepActionConfig[] = [
  {
    action: ScenarioStepAction.TAP,
    label: 'Tap',
    icon: 'touch-app',
    valueKind: 'count',
    valuePlaceholder: 'Select the count',
  },
  {
    action: ScenarioStepAction.SELECT,
    label: 'Select',
    icon: 'arrow-selector-tool',
    valueKind: 'text',
    valuePlaceholder: 'Text',
  },
  {
    action: ScenarioStepAction.ENTER_TEXT,
    label: 'Enter Input',
    icon: 'format-size',
    valueKind: 'secure-text',
    valuePlaceholder: 'Text',
  },
  {
    action: ScenarioStepAction.CHECK,
    label: 'Check',
    icon: 'verified',
    valueKind: 'boolean',
    valuePlaceholder: 'Select',
  },
  {
    action: ScenarioStepAction.WAIT,
    label: 'Wait',
    icon: 'hourglass-pause',
    valueKind: 'duration',
    valuePlaceholder: 'Select the count',
    unitOptions: ['seconds'],
  },
  {
    action: ScenarioStepAction.LONG_PRESS,
    label: 'Long Press',
    icon: 'touch-long',
    valueKind: 'duration',
    valuePlaceholder: 'Select the count',
    unitOptions: ['milliseconds'],
  },
  {
    action: ScenarioStepAction.SWIPE,
    label: 'Swipe',
    icon: 'swipe',
    valueKind: 'direction',
    valuePlaceholder: 'Select',
  },
  {
    action: ScenarioStepAction.DRAG,
    label: 'Drag',
    icon: 'drag-pan',
    valueKind: 'direction',
    valuePlaceholder: 'Select',
  },
];

// ─── Option Constants ────────────────────────────────────────────────────────

export const DIRECTION_OPTIONS = [
  { label: 'Up', value: 'up' },
  { label: 'Down', value: 'down' },
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
];

export const CHECK_OPTIONS = [
  { label: 'Checked', value: 'true' },
  { label: 'Unchecked', value: 'false' },
];

// ─── Utility Functions ────────────────────────────────────────────────────────

export function configForAction(
  action: ScenarioStepAction | null
): StepActionConfig | undefined {
  return STEP_ACTION_CONFIGS.find((config) => config.action === action);
}
