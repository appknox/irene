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

const IDENTIFIER_MAX_LENGTH = 64;
const SECURE_MASK = '************';
const SWIPE_DIRECTIONS = ['up', 'down', 'left', 'right'];
const CHECK_VALUES = ['true', 'false'];

const ENTER_TEXT_MAX_LENGTH = 512;
const SELECT_MAX_LENGTH = 32;

const ERR = {
  identifierRequired: 'dastAutomation.validation.identifierRequired',
  identifierTooLong: 'dastAutomation.validation.identifierTooLong',
  valueRequired: 'dastAutomation.validation.valueRequired',
  tapValueRange: 'dastAutomation.validation.tapValueRange',
  longPressValueRange: 'dastAutomation.validation.longPressValueRange',
  enterTextTooLong: 'dastAutomation.validation.enterTextTooLong',
  selectTooLong: 'dastAutomation.validation.selectTooLong',
  checkValueInvalid: 'dastAutomation.validation.checkValueInvalid',
  swipeValueInvalid: 'dastAutomation.validation.swipeValueInvalid',
  waitValueRange: 'dastAutomation.validation.waitValueRange',
  authenticatorKeyInvalid: 'dastAutomation.validation.authenticatorKeyInvalid',
  otpAppIdInvalid: 'dastAutomation.validation.otpAppIdInvalid',
  otpAppBlocked: 'dastAutomation.validation.otpAppBlocked',
  otpNoteTooLong: 'dastAutomation.validation.otpNoteTooLong',
} as const;

const OTP_APP_ID = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)+$/;
const OTP_APP_ID_MAX_LENGTH = 255;
const OTP_NOTE_MAX_LENGTH = 256;

// Apps the agent must never open to read a code. Mirrors phoenix
// `scenario/schema.py` (OPEN_APP_DENIED_*) and the mycroft step validators.
const OTP_APP_DENIED_IDS = new Set([
  // iOS
  'com.apple.Preferences',
  'com.apple.AppStore',
  'com.apple.TestFlight',
  'com.apple.mobilephone',
  'com.apple.facetime',
  'com.apple.Passbook',
  'com.apple.shortcuts',
  'com.apple.Bridge',
  'com.apple.findmy',
  'com.apple.Health',
  'com.apple.mobileslideshow',
  'com.apple.camera',
  'com.apple.DocumentsApp',
  'com.apple.springboard',
  'org.coolstar.SileoStore',
  'com.saurik.Cydia',
  'xyz.willy.Zebra',
  'com.tigisoftware.Filza',
  'com.opa334.TrollStore',

  // Android
  'com.android.settings',
  'com.android.vending',
  'com.android.dialer',
  'com.google.android.dialer',
  'com.samsung.android.dialer',
  'com.android.packageinstaller',
  'com.google.android.packageinstaller',
  'com.google.android.apps.walletnfcrel',
  'com.samsung.android.spay',
  'com.google.android.apps.photos',
  'com.android.camera',
  'com.android.documentsui',
  'com.google.android.documentsui',
  'com.topjohnwu.magisk',
]);

const OTP_APP_DENIED_PREFIXES = ['com.appknox.'];

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

const BASE32_KEY = /^[A-Z2-7]+=*$/;
const TOTP_MIN_KEY_CHARS = 16;

/** Authenticator setup key (base32, spaces allowed) or an otpauth://totp link; the secure mask passes. */
const authenticatorKey: ValueValidator = ({ raw, trimmed, step }) => {
  if (step.isSecure && raw === SECURE_MASK) {
    return null;
  }

  let key = trimmed;

  if (trimmed.toLowerCase().startsWith('otpauth://')) {
    if (!trimmed.toLowerCase().startsWith('otpauth://totp/')) {
      return ERR.authenticatorKeyInvalid;
    }

    key = new URLSearchParams(trimmed.split('?')[1] ?? '').get('secret') ?? '';
  }

  const cleaned = key.replace(/[\s-]/g, '').toUpperCase();

  return BASE32_KEY.test(cleaned) &&
    cleaned.replace(/=+$/, '').length >= TOTP_MIN_KEY_CHARS
    ? null
    : ERR.authenticatorKeyInvalid;
};

/** Bundle / package id of the app the code is read from (From an app source). */
const otpAppId: ValueValidator = ({ trimmed }) => {
  if (trimmed.length > OTP_APP_ID_MAX_LENGTH || !OTP_APP_ID.test(trimmed)) {
    return ERR.otpAppIdInvalid;
  }

  const isDenied =
    OTP_APP_DENIED_IDS.has(trimmed) ||
    OTP_APP_DENIED_PREFIXES.some((prefix) => trimmed.startsWith(prefix));

  return isDenied ? ERR.otpAppBlocked : null;
};

/** Optional instructions for the agent, stored in `metadata.note`. */
const otpNote: ValueValidator = ({ step }) => {
  const note = step.metadata?.note;

  return typeof note === 'string' && note.length > OTP_NOTE_MAX_LENGTH
    ? ERR.otpNoteTooLong
    : null;
};

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

const enterOtpFromApp = all(required, otpAppId, otpNote);
const enterOtpFromKey = all(required, authenticatorKey);

/** Enter OTP: the value is an app id or an authenticator key, by `metadata.source`. */
const enterOtp: ValueValidator = (ctx) =>
  ctx.step.metadata?.source === 'authenticator_key'
    ? enterOtpFromKey(ctx)
    : enterOtpFromApp(ctx);

// ─── Per-action rules ─────────────────────────────────────────────────────────

const VALUE_VALIDATORS: Partial<Record<ScenarioStepAction, ValueValidator>> = {
  [ScenarioStepAction.TAP]: whenPresent(
    integerInRange(1, 20, ERR.tapValueRange)
  ),

  [ScenarioStepAction.LONG_PRESS]: whenPresent(
    integerInRange(1, 300_000, ERR.longPressValueRange)
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

  [ScenarioStepAction.ENTER_OTP]: enterOtp,

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

  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function validateStep(step: ScenarioStepModel) {
  const errors: StepValidationError = {};

  // Enter OTP has no identifier input; it is always set automatically.
  const identifierError =
    step.action === ScenarioStepAction.ENTER_OTP
      ? null
      : validateIdentifier(step.identifier ?? '');

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
