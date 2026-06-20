import { ScenarioStepAction } from 'irene/models/scenario-step';
import type ScenarioStepModel from 'irene/models/scenario-step';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StepValidationError {
  identifier?: string;
  value?: string;
}

/**
 * Context passed to each value validator. `raw` preserves the original input
 * (needed for length checks and secure-mask detection); `trimmed` is the
 * whitespace-stripped form used for emptiness and content checks.
 */
interface ValueContext {
  raw: string;
  trimmed: string;
  step: ScenarioStepModel;
}

/** Returns an error translation key, or null when the value is valid. */
type ValueValidator = (ctx: ValueContext) => string | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9_]*$/;
const IDENTIFIER_MAX_LENGTH = 64;
const SECURE_MASK = '************';
const SWIPE_DIRECTIONS = ['up', 'down', 'left', 'right'];
const CHECK_VALUES = ['true', 'false'];

const ENTER_TEXT_MAX_LENGTH = 512;
const SELECT_MAX_LENGTH = 32;

const ERR = {
  identifierRequired: 'dastAutomation.validation.identifierRequired',
  identifierTooLong: 'dastAutomation.validation.identifierTooLong',
  identifierInvalidFormat: 'dastAutomation.validation.identifierInvalidFormat',
  valueRequired: 'dastAutomation.validation.valueRequired',
  tapValueRange: 'dastAutomation.validation.tapValueRange',
  longPressValueRange: 'dastAutomation.validation.longPressValueRange',
  enterTextTooLong: 'dastAutomation.validation.enterTextTooLong',
  selectTooLong: 'dastAutomation.validation.selectTooLong',
  checkValueInvalid: 'dastAutomation.validation.checkValueInvalid',
  swipeValueInvalid: 'dastAutomation.validation.swipeValueInvalid',
  waitValueRange: 'dastAutomation.validation.waitValueRange',
} as const;

// ─── Composable value validators ──────────────────────────────────────────────

const required: ValueValidator = ({ trimmed }) =>
  trimmed ? null : ERR.valueRequired;

const maxLength =
  (max: number, errKey: string): ValueValidator =>
  ({ raw }) =>
    raw.length > max ? errKey : null;

/** Like `maxLength`, but allows the secure mask to pass for secure steps. */
const maxLengthAllowingSecureMask =
  (max: number, errKey: string): ValueValidator =>
  ({ raw, step }) => {
    const isMaskedSecure = step.isSecure && raw === SECURE_MASK;

    return !isMaskedSecure && raw.length > max ? errKey : null;
  };

const integerInRange =
  (min: number, max: number, errKey: string): ValueValidator =>
  ({ trimmed }) => {
    const n = Number(trimmed);

    return !Number.isInteger(n) || n < min || n > max ? errKey : null;
  };

const oneOf =
  (allowed: string[], errKey: string): ValueValidator =>
  ({ trimmed }) =>
    allowed.includes(trimmed.toLowerCase()) ? null : errKey;

/** Skips the wrapped validator when the value is empty (for optional fields). */
const whenPresent =
  (validator: ValueValidator): ValueValidator =>
  (ctx) =>
    ctx.trimmed ? validator(ctx) : null;

/** Runs validators in order; returns the first error, or null if all pass. */
const all =
  (...validators: ValueValidator[]): ValueValidator =>
  (ctx) => {
    for (const v of validators) {
      const err = v(ctx);

      if (err) {
        return err;
      }
    }

    return null;
  };

// ─── Per-action rules ─────────────────────────────────────────────────────────

const VALUE_VALIDATORS: Partial<Record<ScenarioStepAction, ValueValidator>> = {
  [ScenarioStepAction.TAP]: whenPresent(
    integerInRange(1, 20, ERR.tapValueRange)
  ),

  [ScenarioStepAction.LONG_PRESS]: whenPresent(
    integerInRange(1, Number.MAX_SAFE_INTEGER, ERR.longPressValueRange)
  ),

  [ScenarioStepAction.ENTER_TEXT]: all(
    required,
    maxLengthAllowingSecureMask(ENTER_TEXT_MAX_LENGTH, ERR.enterTextTooLong)
  ),

  [ScenarioStepAction.SELECT]: all(
    required,
    maxLength(SELECT_MAX_LENGTH, ERR.selectTooLong)
  ),

  [ScenarioStepAction.CHECK]: whenPresent(
    oneOf(CHECK_VALUES, ERR.checkValueInvalid)
  ),

  [ScenarioStepAction.SWIPE]: all(
    required,
    oneOf(SWIPE_DIRECTIONS, ERR.swipeValueInvalid)
  ),

  [ScenarioStepAction.WAIT]: all(
    required,
    integerInRange(1, 60, ERR.waitValueRange)
  ),
};

// ─── Identifier validation ────────────────────────────────────────────────────

function validateIdentifier(identifier: string): string | null {
  const trimmed = identifier.trim();

  if (!trimmed) {
    return ERR.identifierRequired;
  }

  if (trimmed.length > IDENTIFIER_MAX_LENGTH) {
    return ERR.identifierTooLong;
  }

  if (!IDENTIFIER_PATTERN.test(trimmed)) {
    return ERR.identifierInvalidFormat;
  }

  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function validateStep(step: ScenarioStepModel) {
  const errors: StepValidationError = {};

  const identifierError = validateIdentifier(step.identifier ?? '');
  if (identifierError) {
    errors.identifier = identifierError;
  }

  const raw = step.value ?? '';
  const validator = VALUE_VALIDATORS[step.action];

  if (validator) {
    const valueError = validator({ raw, trimmed: raw.trim(), step });

    if (valueError) {
      errors.value = valueError;
    }
  }

  return errors.identifier || errors.value ? errors : null;
}
