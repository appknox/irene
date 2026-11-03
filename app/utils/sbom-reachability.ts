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

/**
 * Who owns one frame of a call path. The engine resolves this — package
 * prefixes cannot, because shaded dependencies and multi-module apps both
 * break the naive mapping.
 */
export const WitnessOwnerKind = {
  APP: 'APP',
  COMPONENT: 'COMPONENT',
  PLATFORM: 'PLATFORM',
} as const;

export type WitnessOwnerKindValue =
  (typeof WitnessOwnerKind)[keyof typeof WitnessOwnerKind];

export interface SbomReachabilityWitnessOwner {
  kind: WitnessOwnerKindValue;
  component_ref?: string | null;
  /** Display name, e.g. "LeafPic" or "jackson-databind 2.9.8". */
  label?: string | null;
}

/**
 * One frame of a call path. Carried alongside `witness_path` rather than on
 * its edges: the annotations describe nodes, and the entry point has no
 * incoming edge to hang them on.
 */
export interface SbomReachabilityWitnessNode {
  signature: string;
  /** Plain-English description of what happens at this frame. */
  note?: string | null;
  owner?: SbomReachabilityWitnessOwner | null;
  /** Edge type arriving at this node; absent for the entry point. */
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
  /** Whether a call path was recorded for this target. */
  has_witness?: boolean;
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
  /** Node-level view of the call path, when the engine supplied one. */
  witness_nodes?: SbomReachabilityWitnessNode[];
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

/**
 * Split a signature into its package and a short `Class.method()` form.
 * DEX signatures are read raw so nested-class markers (`$`) survive; anything
 * else falls back to splitting the dotted name, and signatures with no dots
 * (mangled Swift symbols) pass through whole.
 */
export function shortSignature(signature: string): {
  packageName: string | null;
  display: string;
} {
  const dex = signature.match(/^L([^;]+);->([^(<]+)(\(.*)?$/);

  if (dex) {
    const [, rawOwner = '', name = ''] = dex;
    const segments = rawOwner.split('/');
    const className = segments.pop() ?? '';

    return {
      packageName: segments.join('.') || null,
      display: `${className}.${name}()`,
    };
  }

  const segments = (signature.split('(')[0] ?? signature).split('.');

  if (segments.length < 2) {
    return { packageName: null, display: signature };
  }

  const method = segments.pop() as string;
  const className = segments.pop() as string;

  return {
    packageName: segments.join('.') || null,
    display: `${className}.${method}()`,
  };
}

export interface SbomReachabilityWitnessItem {
  /** Human-readable signature (Java form for DEX signatures). */
  display: string;
  /** Condensed `Class.method()` form for the default view. */
  shortDisplay: string;
  /** Package the frame lives in; null when it cannot be determined. */
  packageName: string | null;
  /** Raw signature as emitted by the engine. */
  signature: string;
  /** Edge type arriving at this step; undefined for the first step. */
  edgeType?: string;
  /** Plain-English description of this frame, when the engine supplied one. */
  note?: string | null;
  owner?: SbomReachabilityWitnessOwner | null;
}

function toWitnessItem(
  node: SbomReachabilityWitnessNode
): SbomReachabilityWitnessItem {
  const short = shortSignature(node.signature);

  return {
    signature: node.signature,
    display: formatDexSignature(node.signature),
    shortDisplay: short.display,
    packageName: short.packageName,
    edgeType:
      node.edge_type && node.edge_type !== 'DIRECT'
        ? node.edge_type
        : undefined,
    note: node.note ?? null,
    owner: node.owner ?? null,
  };
}

/** Flatten ordered edges into the node sequence they describe. */
export function witnessNodesFromPath(
  path?: SbomReachabilityWitnessEdge[] | null
): SbomReachabilityWitnessNode[] {
  if (!path?.length) {
    return [];
  }

  const [first, ...rest] = path;

  if (!first) {
    return [];
  }

  return [
    { signature: first.caller },
    { signature: first.callee, edge_type: first.edge_type },
    ...rest.map((edge) => ({
      signature: edge.callee,
      edge_type: edge.edge_type,
    })),
  ].filter((node) => node.signature);
}

export function reachabilityWitnessItems(
  path?: SbomReachabilityWitnessEdge[] | null
): SbomReachabilityWitnessItem[] {
  return witnessNodesFromPath(path).map(toWitnessItem);
}

/**
 * The call path to render. `witness_nodes` carries the engine's per-frame
 * annotations and ownership; without it the path is derived from the edges
 * and renders unannotated.
 */
export function reachabilityWitnessPathItems(
  finding?: SbomReachabilityFinding | null
): SbomReachabilityWitnessItem[] {
  const nodes = finding?.witness_nodes?.length
    ? finding.witness_nodes
    : witnessNodesFromPath(finding?.witness_path);

  return nodes.filter((node) => node.signature).map(toWitnessItem);
}

export interface SbomReachabilityWitnessGroup<
  T extends SbomReachabilityWitnessItem = SbomReachabilityWitnessItem,
> {
  kind: WitnessOwnerKindValue | null;
  label: string | null;
  componentRef: string | null;
  items: T[];
}

/**
 * Collapse consecutive frames sharing an owner into one group, so the path
 * renders as "your code" then the library it enters. Unowned paths return a
 * single anonymous group and render flat.
 */
export function groupWitnessByOwner<T extends SbomReachabilityWitnessItem>(
  items: T[]
): SbomReachabilityWitnessGroup<T>[] {
  const groups: SbomReachabilityWitnessGroup<T>[] = [];

  for (const item of items) {
    const kind = item.owner?.kind ?? null;
    const label = item.owner?.label ?? null;
    const last = groups[groups.length - 1];

    if (last && last.kind === kind && last.label === label) {
      last.items.push(item);
      continue;
    }

    groups.push({
      kind,
      label,
      componentRef: item.owner?.component_ref ?? null,
      items: [item],
    });
  }

  return groups;
}

/**
 * Index of the frame to mark "Fix here": the last app-owned frame before
 * control leaves the app. Returns -1 when ownership is unknown.
 */
export function fixHereWitnessIndex(
  items: SbomReachabilityWitnessItem[]
): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const current = items[index];
    const next = items[index + 1];

    if (
      current?.owner?.kind === WitnessOwnerKind.APP &&
      next &&
      next.owner?.kind !== WitnessOwnerKind.APP
    ) {
      return index;
    }
  }

  return -1;
}

/**
 * The engine's witness explanation is a two-part template (see enola's
 * `reachability/explanation/template.py`): an "App behavior" narrative, then
 * an "Analyst assessment" carrying the uncertain transition. The second part
 * quotes raw engine signatures, so the UI keeps it behind a disclosure rather
 * than in the reading flow.
 */
const NARRATIVE_BEHAVIOR_PREFIX = 'App behavior:';
const NARRATIVE_DETAIL_PREFIX = 'Analyst assessment:';

export interface SbomReachabilityNarrative {
  behavior: string;
  detail: string | null;
}

export function splitWitnessNarrative(
  narrative?: string | null
): SbomReachabilityNarrative | null {
  const raw = narrative?.trim();

  if (!raw) {
    return null;
  }

  const behavior: string[] = [];
  const detail: string[] = [];

  for (const block of raw.split(/\n\s*\n/)) {
    const text = block.trim();

    if (!text) {
      continue;
    }

    if (text.startsWith(NARRATIVE_DETAIL_PREFIX)) {
      detail.push(text.slice(NARRATIVE_DETAIL_PREFIX.length).trim());
    } else if (text.startsWith(NARRATIVE_BEHAVIOR_PREFIX)) {
      behavior.push(text.slice(NARRATIVE_BEHAVIOR_PREFIX.length).trim());
    } else {
      behavior.push(text);
    }
  }

  return {
    behavior: behavior.join('\n\n'),
    detail: detail.join('\n\n') || null,
  };
}

/** Length past which the narrative is clamped behind a "Show more" toggle. */
export const NARRATIVE_CLAMP_THRESHOLD = 240;

export interface SbomReachabilityTargetSplit {
  called: SbomReachabilityTarget[];
  alsoAffected: SbomReachabilityTarget[];
}

/**
 * Separate the vulnerable functions the app actually calls from those that
 * are present but unreached. Payloads predating `has_witness` fall back to
 * the serializer's own rule: it promotes the first witness-bearing target.
 */
export function splitFindingTargets(
  finding?: SbomReachabilityFinding | null
): SbomReachabilityTargetSplit {
  const targets = finding?.targets ?? [];

  if (!targets.length) {
    return { called: [], alsoAffected: [] };
  }

  if (targets.some((target) => target.has_witness !== undefined)) {
    return {
      called: targets.filter((target) => target.has_witness),
      alsoAffected: targets.filter((target) => !target.has_witness),
    };
  }

  const [first, ...rest] = targets;

  return finding?.witness_path?.length && first
    ? { called: [first], alsoAffected: rest }
    : { called: [], alsoAffected: targets };
}
