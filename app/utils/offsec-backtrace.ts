/**
 * Parses the `stack` of a detection trigger (`finding.detail.detection_backtrace[].stack`).
 *
 * Two frame shapes reach the dashboard:
 * - native (iOS): `Module!symbol` or `Module!0xOFFSET`, e.g. `Foundation!-[NSFileManager
 *   fileExistsAtPath:]` or `Agrivita!0x63f88`;
 * - Java (Android): `package.Class.method`, e.g. `com.example.a.RootCheck.check`.
 *
 * Each frame is tagged by owner: `app` when it is in the app's own code, `system` when it is in
 * the OS or a platform runtime, `unknown` when the trigger gives nothing to decide on. The
 * trigger's `app_frame` is the first app-owned frame; its module (native) names the app binary.
 */

export type OffsecFrameOwner = 'app' | 'system' | 'unknown';

export interface OffsecStackFrame {
  raw: string;
  /** Binary (native) or class (Java); empty when the frame has no prefix. */
  module: string;
  /** `!` (native) or `.` (Java) between module and location; empty with no module. */
  separator: string;
  /** Symbol, method or hex offset inside the module. */
  location: string;
  isOffset: boolean;
  owner: OffsecFrameOwner;
  /** True for the trigger's `app_frame`: the frame to hook or patch. */
  isAppFrame: boolean;
}

const HEX_OFFSET = /^0x[0-9a-f]+$/i;

const JAVA_SYSTEM_PREFIXES = [
  'java.',
  'javax.',
  'jdk.',
  'sun.',
  'android.',
  'androidx.',
  'kotlin.',
  'kotlinx.',
  'dalvik.',
  'libcore.',
  'com.android.',
];

function splitFrame(raw: string): {
  module: string;
  location: string;
  native: boolean;
} {
  const bang = raw.indexOf('!');

  if (bang > 0) {
    return {
      module: raw.slice(0, bang),
      location: raw.slice(bang + 1),
      native: true,
    };
  }

  const dot = raw.lastIndexOf('.');

  if (dot > 0 && !raw.includes(' ')) {
    return {
      module: raw.slice(0, dot),
      location: raw.slice(dot + 1),
      native: false,
    };
  }

  return { module: '', location: raw, native: false };
}

/** The app binary a native trigger points at, read from its `app_frame`. */
export function appModuleOf(appFrame: unknown): string {
  if (typeof appFrame !== 'string' || !appFrame.includes('!')) {
    return '';
  }

  return splitFrame(appFrame).module;
}

export function parseOffsecFrame(
  raw: string,
  appFrame: string | null = null
): OffsecStackFrame {
  const text = raw.trim();
  const { module, location, native } = splitFrame(text);
  const isAppFrame = appFrame !== null && text === appFrame.trim();
  const appModule = appModuleOf(appFrame);

  let owner: OffsecFrameOwner = 'unknown';

  if (isAppFrame) {
    owner = 'app';
  } else if (native) {
    if (appModule) {
      owner = module === appModule ? 'app' : 'system';
    }
  } else if (JAVA_SYSTEM_PREFIXES.some((p) => text.startsWith(p))) {
    owner = 'system';
  }

  let separator = '';

  if (module) {
    separator = native ? '!' : '.';
  }

  return {
    raw: text,
    module,
    separator,
    location,
    isOffset: native && HEX_OFFSET.test(location),
    owner,
    isAppFrame,
  };
}

/** The parsed stack of one trigger; non-string and blank frames are dropped. */
export function parseOffsecStack(
  stack: unknown,
  appFrame: unknown = null
): OffsecStackFrame[] {
  if (!Array.isArray(stack)) {
    return [];
  }

  const frame = typeof appFrame === 'string' && appFrame ? appFrame : null;

  return stack
    .filter((f): f is string => typeof f === 'string' && f.trim() !== '')
    .map((f) => parseOffsecFrame(f, frame));
}
