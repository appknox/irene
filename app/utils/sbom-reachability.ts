import type { AkChipColor } from 'irene/components/ak-chip';

export const ReachabilityVerdict = {
  REACHABLE: 'REACHABLE',
  CONFIRMED_REACHABLE: 'CONFIRMED_REACHABLE',
  POTENTIALLY_REACHABLE: 'POTENTIALLY_REACHABLE',
  NO_PATH_FOUND: 'NO_PATH_FOUND',
  CONDITION_MET: 'CONDITION_MET',
  CONDITION_POSSIBLY_MET: 'CONDITION_POSSIBLY_MET',
  CONDITION_NOT_MET: 'CONDITION_NOT_MET',
  UNKNOWN: 'UNKNOWN',
  UNSUPPORTED: 'UNSUPPORTED',
} as const;

export type ReachabilityVerdictValue =
  (typeof ReachabilityVerdict)[keyof typeof ReachabilityVerdict];

export const ReachabilityScanStatus = {
  PENDING: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  FAILED: 4,
  SKIPPED: 5,
} as const;

export type ReachabilityScanStatusValue =
  (typeof ReachabilityScanStatus)[keyof typeof ReachabilityScanStatus];

export const TargetPresence = {
  PRESENT: 'PRESENT',
  NOT_OBSERVED: 'NOT_OBSERVED',
  AMBIGUOUS: 'AMBIGUOUS',
} as const;

export const FindingExposure = {
  CONFIRMED: 'CONFIRMED_EXPOSURE',
  POTENTIAL: 'POTENTIAL_EXPOSURE',
  NONE_OBSERVED: 'NO_EXPOSURE_OBSERVED',
  UNKNOWN: 'UNKNOWN',
  UNSUPPORTED: 'UNSUPPORTED',
} as const;

export interface SbomReachabilityWitnessEdge {
  caller: string;
  callee: string;
  edge_type?: string;
}

export interface SbomReachabilityTarget {
  label?: string | null;
  presence?: string;
  verdict?: string;
  match_technique?: string;
  capability_tier?: string;
  /** Optional AI-generated prose explaining this target's witness path. */
  explanation?: string | null;
}

export interface SbomReachabilityFinding {
  verdict: string;
  exposure?: string;
  target_presence?: string;
  summary?: string;
  target?: string | null;
  targets?: SbomReachabilityTarget[];
  targets_count?: number;
  blockers?: string[];
  witness_path?: SbomReachabilityWitnessEdge[];
}

export interface SbomComponentReachability {
  verdict: string;
  exposure?: string;
  /** Engine dependency verdict: whether this component's code is in the binary. */
  code_presence?: string;
  path_found_count: number;
  potential_count?: number;
  no_path_found_count?: number;
  advisory_count: number;
  unknown_count: number;
}

const QUIET_VERDICTS = new Set<string>([
  ReachabilityVerdict.UNKNOWN,
  ReachabilityVerdict.UNSUPPORTED,
]);

const PATH_FOUND_VERDICTS = new Set<string>([
  ReachabilityVerdict.REACHABLE,
  ReachabilityVerdict.CONFIRMED_REACHABLE,
  ReachabilityVerdict.CONDITION_MET,
]);

const POTENTIAL_VERDICTS = new Set<string>([
  ReachabilityVerdict.POTENTIALLY_REACHABLE,
  ReachabilityVerdict.CONDITION_POSSIBLY_MET,
]);

const NO_PATH_VERDICTS = new Set<string>([
  ReachabilityVerdict.NO_PATH_FOUND,
  ReachabilityVerdict.CONDITION_NOT_MET,
]);

export function isPathFoundVerdict(verdict?: string | null): boolean {
  return PATH_FOUND_VERDICTS.has(verdict ?? '');
}

/**
 * Verdicts that owe the customer an explanation: a likely path exists, or no
 * reliable conclusion could be reached. Conclusive verdicts (reachable, not
 * reachable) and unsupported do not show inconclusive reasons.
 */
export function isInconclusiveVerdict(verdict?: string | null): boolean {
  return (
    POTENTIAL_VERDICTS.has(verdict ?? '') ||
    verdict === ReachabilityVerdict.UNKNOWN
  );
}

export function isQuietReachabilityVerdict(verdict?: string | null): boolean {
  return !verdict || QUIET_VERDICTS.has(verdict);
}

export function shouldShowReachabilityChip(verdict?: string | null): boolean {
  return Boolean(verdict);
}

export function shouldShowReachabilityDetail(
  finding?: SbomReachabilityFinding | null
): boolean {
  if (!finding) {
    return false;
  }

  if (finding.target || finding.witness_path?.length) {
    return true;
  }

  if (!isQuietReachabilityVerdict(finding.verdict)) {
    return true;
  }

  const blockers = finding.blockers ?? [];

  return blockers.length > 0;
}

export function reachabilityChipColor(verdict?: string | null): AkChipColor {
  if (isPathFoundVerdict(verdict)) {
    return 'primary';
  }

  if (POTENTIAL_VERDICTS.has(verdict ?? '')) {
    return 'warn';
  }

  return 'default';
}

export function reachabilityLabelKey(verdict?: string | null): string {
  if (isPathFoundVerdict(verdict)) {
    return 'sbomModule.reachability.pathFound';
  }

  if (POTENTIAL_VERDICTS.has(verdict ?? '')) {
    return 'sbomModule.reachability.potential';
  }

  if (NO_PATH_VERDICTS.has(verdict ?? '')) {
    return 'sbomModule.reachability.noPathFound';
  }

  switch (verdict) {
    case ReachabilityVerdict.UNSUPPORTED:
      return 'sbomModule.reachability.unsupported';
    default:
      return 'sbomModule.reachability.inconclusive';
  }
}

/**
 * The engine's exposure value folds reachability + condition verdicts into one
 * customer-facing conclusion. Map it back to the equivalent verdict family so
 * label/color/explanation stay single-sourced.
 */
const EXPOSURE_TO_VERDICT: Record<string, ReachabilityVerdictValue> = {
  [FindingExposure.CONFIRMED]: ReachabilityVerdict.CONFIRMED_REACHABLE,
  [FindingExposure.POTENTIAL]: ReachabilityVerdict.POTENTIALLY_REACHABLE,
  [FindingExposure.NONE_OBSERVED]: ReachabilityVerdict.NO_PATH_FOUND,
  [FindingExposure.UNSUPPORTED]: ReachabilityVerdict.UNSUPPORTED,
  [FindingExposure.UNKNOWN]: ReachabilityVerdict.UNKNOWN,
};

export function verdictForExposure(
  exposure?: string | null
): ReachabilityVerdictValue | null {
  if (!exposure) {
    return null;
  }

  return EXPOSURE_TO_VERDICT[exposure] ?? ReachabilityVerdict.UNKNOWN;
}

export function reachabilityExplanationKey(verdict?: string | null): string {
  if (isPathFoundVerdict(verdict)) {
    return 'sbomModule.reachability.explanation.reachable';
  }

  if (POTENTIAL_VERDICTS.has(verdict ?? '')) {
    return 'sbomModule.reachability.explanation.potential';
  }

  if (NO_PATH_VERDICTS.has(verdict ?? '')) {
    return 'sbomModule.reachability.explanation.noPathFound';
  }

  if (verdict === ReachabilityVerdict.UNSUPPORTED) {
    return 'sbomModule.reachability.explanation.unsupported';
  }

  return 'sbomModule.reachability.explanation.inconclusive';
}

export function presenceLabelKey(presence?: string | null): string {
  switch (presence) {
    case TargetPresence.PRESENT:
      return 'sbomModule.reachability.presentInVersion';
    case TargetPresence.NOT_OBSERVED:
      return 'sbomModule.reachability.notObserved';
    case TargetPresence.AMBIGUOUS:
      return 'sbomModule.reachability.ambiguous';
    default:
      return 'sbomModule.reachability.noReviewedTarget';
  }
}

/**
 * Customer-facing blocker category. Engine codes are grouped so the UI never
 * shows raw codes by default; the code stays available as a tooltip for
 * support and power users.
 */
const BLOCKER_CATEGORY_KEYS: [pattern: RegExp, key: string][] = [
  [/TARGET_DATA_MISSING/, 'noTargetData'],
  [/^IOS_TARGET_SYMBOL_NOT_OBSERVED$/, 'notInBinary'],
  [/^IOS_TARGET_SYMBOL_AMBIGUOUS$/, 'ambiguousSymbol'],
  [/^IOS_ENTRY_ROOT_NOT_OBSERVED$/, 'iosEntryPoint'],
  [
    /^IOS_(?:DIRECT_CALL_PATH_NOT_FOUND|INDIRECT_DISPATCH_UNMODELED)$/,
    'iosIndirectCalls',
  ],
  [/TARGET_NOT_OBSERVED|COMPONENT_CODE_NOT_OBSERVED/, 'notInBinary'],
  [/^R8_/, 'obfuscation'],
  [
    /REFLECTION_|METHOD_HANDLE_|INVOKE_CUSTOM_|DYNAMIC_CODE_LOADING|NESTED_DEX_|PACKAGED_DEX_|DYNAMIC_CLASS_LOADERS/,
    'dynamicCode',
  ],
  [/^JNI_/, 'nativeBoundary'],
  [/FLUTTER_|DART_|HERMES|REACT_NATIVE_|REACT_METHOD_/, 'framework'],
  [/TARGET_CAPABILITY_/, 'limitedEvidence'],
  [/ARTIFACT_|INSTALLED_SPLIT_|AAB_|ANDROID_DELIVERY_VIEW_/, 'artifact'],
  [
    /INSUFFICIENT_MEMORY|MEMORY_ADMISSION_DEFERRED|DEX_PARSER_MEMORY_PRESSURE|_LIMIT_EXCEEDED$|_TIMEOUT$/,
    'resourceLimit',
  ],
];

export function blockerCategoryKey(blocker: string): string {
  const found = BLOCKER_CATEGORY_KEYS.find(([pattern]) =>
    pattern.test(blocker)
  );

  return `sbomModule.reachability.blockerCategories.${found?.[1] ?? 'other'}`;
}

const DEX_PRIMITIVE_NAMES: Record<string, string> = {
  V: 'void',
  Z: 'boolean',
  B: 'byte',
  S: 'short',
  C: 'char',
  I: 'int',
  J: 'long',
  F: 'float',
  D: 'double',
};

function formatDexType(descriptor: string, offset: number): [string, number] {
  let index = offset;
  let arrays = 0;

  while (descriptor[index] === '[') {
    arrays += 1;
    index += 1;
  }

  let type: string;
  const char = descriptor[index] ?? '';

  if (char === 'L') {
    const end = descriptor.indexOf(';', index);
    type = descriptor
      .slice(index + 1, end === -1 ? undefined : end)
      .replaceAll('/', '.')
      .replaceAll('$', '.');
    index = end === -1 ? descriptor.length : end + 1;
  } else {
    type = DEX_PRIMITIVE_NAMES[char] ?? char;
    index += 1;
  }

  return [`${type}${'[]'.repeat(arrays)}`, index];
}

/**
 * Render a DEX-style signature (`Lcom/foo/Bar;->baz(I)V`) as Java source form
 * (`com.foo.Bar.baz(int)`). Non-DEX signatures pass through unchanged.
 */
export function formatDexSignature(signature: string): string {
  const match = signature.match(/^L([^;]+);->([^(<]+)(\(.*)?$/);

  if (!match) {
    return signature;
  }

  const [, rawOwner = '', name = '', params] = match;

  const owner = rawOwner.replaceAll('/', '.').replaceAll('$', '.');

  const simpleName = owner.split('.').pop() ?? name;
  const method = name === '<init>' ? simpleName : name;

  if (!params) {
    return `${owner}.${method}`;
  }

  const paramTypes: string[] = [];
  let index = 1;

  while (index < params.length && params[index] !== ')') {
    const [type, next] = formatDexType(params, index);
    paramTypes.push(type);
    index = next;
  }

  return `${owner}.${method}(${paramTypes.join(', ')})`;
}

export interface SbomReachabilityWitnessItem {
  /** Human-readable signature (Java form for DEX signatures). */
  display: string;
  /** Raw signature as emitted by the engine. */
  signature: string;
  /** Edge type arriving at this step; undefined for the first step. */
  edgeType?: string;
}

export function reachabilityWitnessItems(
  path?: SbomReachabilityWitnessEdge[] | null
): SbomReachabilityWitnessItem[] {
  if (!path?.length) {
    return [];
  }

  const [first, ...rest] = path;

  if (!first) {
    return [];
  }

  const signatures: { signature: string; edgeType?: string }[] = [
    { signature: first.caller },
    { signature: first.callee, edgeType: first.edge_type },
    ...rest.map((edge) => ({
      signature: edge.callee,
      edgeType: edge.edge_type,
    })),
  ];

  return signatures
    .filter((item) => item.signature)
    .map((item) => ({
      signature: item.signature,
      display: formatDexSignature(item.signature),
      edgeType:
        item.edgeType && item.edgeType !== 'DIRECT' ? item.edgeType : undefined,
    }));
}
