import type { AkIconVariantType } from 'ak-icons';
import ENUMS from 'irene/enums';

import {
  ScenarioStepAction,
  type ScenarioStepMetadata,
} from 'irene/models/scenario-step';

// ─── Types ───────────────────────────────────────────────────────────────────
export type StepValueKind =
  | 'count' // tap: times (1–20)
  | 'text' // select: option label
  | 'secure-text' // enter_text: value, lockable via is_secure
  | 'boolean' // check: checked
  | 'duration' // wait, long_press: number + unit (ms/s/m)
  | 'direction' // swipe, drag: up/down/left/right
  | 'otp'; // enter_otp: app id or authenticator key, by metadata.source

export type StepActionLabelKey =
  | 'dastAutomation.stepActions.tap'
  | 'dastAutomation.stepActions.select'
  | 'dastAutomation.stepActions.enterInput'
  | 'dastAutomation.stepActions.check'
  | 'dastAutomation.stepActions.wait'
  | 'dastAutomation.stepActions.longPress'
  | 'dastAutomation.stepActions.swipe'
  | 'dastAutomation.stepActions.drag'
  | 'dastAutomation.stepActions.enterOtp';

export type StepPlaceholderKey =
  | 'dastAutomation.stepPlaceholders.count'
  | 'dastAutomation.stepPlaceholders.text'
  | 'dastAutomation.stepPlaceholders.select'
  | 'dastAutomation.stepPlaceholders.enterValue'
  | 'dastAutomation.stepPlaceholders.otpAppId'
  | 'dastAutomation.stepPlaceholders.otpNote'
  | 'dastAutomation.stepPlaceholders.authenticatorKey'
  | 'dastAutomation.otpCodeFrom';

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
  identifierPlaceholder?: StepPlaceholderKey;
  unitOptions?: string[];
  defaultValue?: string;
  defaultMetadata?: ScenarioStepMetadata;
}

export interface DirectionOption {
  label: DirectionLabelKey;
  value: string;
}

export interface CheckOption {
  label: CheckLabelKey;
  value: string;
}

/** A known app the OTP is read from; `label` is a brand name (not translated). */
export interface OtpAppOption {
  label: string;
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
    defaultValue: '1',
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
    defaultValue: 'true',
  },
  {
    action: ScenarioStepAction.WAIT,
    label: 'dastAutomation.stepActions.wait',
    icon: 'hourglass-pause',
    valueKind: 'duration',
    valuePlaceholder: 'dastAutomation.stepPlaceholders.count',
    unitOptions: ['dastAutomation.units.seconds'],
    defaultValue: '1',
  },
  {
    action: ScenarioStepAction.LONG_PRESS,
    label: 'dastAutomation.stepActions.longPress',
    icon: 'touch-long',
    valueKind: 'duration',
    valuePlaceholder: 'dastAutomation.stepPlaceholders.count',
    unitOptions: ['dastAutomation.units.milliseconds'],
    defaultValue: '1000',
  },
  {
    action: ScenarioStepAction.SWIPE,
    label: 'dastAutomation.stepActions.swipe',
    icon: 'swipe',
    valueKind: 'direction',
    valuePlaceholder: 'dastAutomation.stepPlaceholders.select',
    defaultValue: 'up',
  },
  {
    action: ScenarioStepAction.ENTER_OTP,
    label: 'dastAutomation.stepActions.enterOtp',
    icon: 'key',
    valueKind: 'otp',
    valuePlaceholder: 'dastAutomation.otpCodeFrom',
    defaultMetadata: { source: 'app' },
  },
  // Temporarily disabled until the drag step value format is finalized.
  // {
  //   action: ScenarioStepAction.DRAG,
  //   label: 'dastAutomation.stepActions.drag',
  //   icon: 'drag-pan',
  //   valueKind: 'direction',
  //   valuePlaceholder: 'dastAutomation.stepPlaceholders.select',
  // },
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

// Enter OTP has no identifier input; the code field gets this name instead,
// numbered when the same steps list already has an Enter OTP step using it.
export const OTP_IDENTIFIER_BASE = 'Verification code';
const OTP_IDENTIFIER_PATTERN = /^Verification code( \d+)?$/;

export const IOS_OTP_APPS: OtpAppOption[] = [
  { label: 'Messages', value: 'com.apple.MobileSMS' },
  { label: 'Mail', value: 'com.apple.mobilemail' },
  { label: 'Gmail', value: 'com.google.Gmail' },
  { label: 'Outlook', value: 'com.microsoft.Office.Outlook' },
  { label: 'Google Authenticator', value: 'com.google.Authenticator' },
  {
    label: 'Microsoft Authenticator',
    value: 'com.microsoft.azureauthenticator',
  },
  { label: '2FAS', value: 'com.twofas.org' },
  { label: 'Authy', value: 'com.authy' },
  { label: 'Bitwarden Authenticator', value: 'com.bitwarden.authenticator' },
];

export const ANDROID_OTP_APPS: OtpAppOption[] = [
  { label: 'Messages', value: 'com.google.android.apps.messaging' },
  { label: 'Samsung Messages', value: 'com.samsung.android.messaging' },
  { label: 'Gmail', value: 'com.google.android.gm' },
  { label: 'Outlook', value: 'com.microsoft.office.outlook' },
  {
    label: 'Google Authenticator',
    value: 'com.google.android.apps.authenticator2',
  },
  { label: 'Microsoft Authenticator', value: 'com.azure.authenticator' },
  { label: '2FAS', value: 'com.twofasapp' },
  { label: 'Authy', value: 'com.authy.authy' },
  { label: 'Bitwarden Authenticator', value: 'com.bitwarden.authenticator' },
];

// ─── Utility Functions ────────────────────────────────────────────────────────

export function configForAction(
  action: ScenarioStepAction | null
): StepActionConfig | undefined {
  return STEP_ACTION_CONFIGS.find((config) => config.action === action);
}

/**
 * Known OTP apps for a project platform. When the platform is unknown, both
 * lists are offered with a platform suffix so same-named apps stay distinct.
 */
export function otpAppsForPlatform(platform?: number | null): OtpAppOption[] {
  if (platform === ENUMS.PLATFORM.IOS) {
    return IOS_OTP_APPS;
  }

  if (platform === ENUMS.PLATFORM.ANDROID) {
    return ANDROID_OTP_APPS;
  }

  const withSuffix = (apps: OtpAppOption[], suffix: string) =>
    apps.map((app) => ({ ...app, label: `${app.label} (${suffix})` }));

  return [
    ...withSuffix(IOS_OTP_APPS, 'iOS'),
    ...withSuffix(ANDROID_OTP_APPS, 'Android'),
  ];
}

/** True when the identifier is one `otpIdentifierFor` would generate. */
export function isAutoOtpIdentifier(identifier?: string | null) {
  return OTP_IDENTIFIER_PATTERN.test(identifier ?? '');
}

/** First of "Verification code", "Verification code 2", … not in `taken`. */
export function otpIdentifierFor(taken: string[]) {
  const used = new Set(taken);

  let identifier = OTP_IDENTIFIER_BASE;

  for (let n = 2; used.has(identifier); n++) {
    identifier = `${OTP_IDENTIFIER_BASE} ${n}`;
  }

  return identifier;
}
