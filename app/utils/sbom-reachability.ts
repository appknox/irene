import type { AkChipColor } from 'irene/components/ak-chip';

export const ReachabilityVerdict = {
  REACHABLE: 'REACHABLE',
  CONFIRMED_REACHABLE: 'CONFIRMED_REACHABLE',
  POTENTIALLY_REACHABLE: 'POTENTIALLY_REACHABLE',
  NO_PATH_FOUND: 'NO_PATH_FOUND',
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

export interface SbomReachabilityWitnessEdge {
  caller: string;
  callee: string;
  edge_type?: string;
}

export interface SbomReachabilityFinding {
  verdict: string;
  target_presence?: string;
  summary?: string;
  target?: string | null;
  blockers?: string[];
  witness_path?: SbomReachabilityWitnessEdge[];
}

export interface SbomComponentReachability {
  verdict: string;
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
]);

export function isPathFoundVerdict(verdict?: string | null): boolean {
  return PATH_FOUND_VERDICTS.has(verdict ?? '');
}

export function isQuietReachabilityVerdict(verdict?: string | null): boolean {
  return !verdict || QUIET_VERDICTS.has(verdict);
}

export function shouldShowReachabilityChip(verdict?: string | null): boolean {
  return !isQuietReachabilityVerdict(verdict);
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

  if (blockers.length === 0) {
    return false;
  }

  return !(
    blockers.length === 1 && blockers[0] === 'TARGET_DATA_MISSING'
  );
}

export function reachabilityChipColor(verdict?: string | null): AkChipColor {
  if (isPathFoundVerdict(verdict)) {
    return 'primary';
  }

  if (verdict === ReachabilityVerdict.POTENTIALLY_REACHABLE) {
    return 'warn';
  }

  return 'default';
}

export function reachabilityLabelKey(verdict?: string | null): string {
  if (isPathFoundVerdict(verdict)) {
    return 'sbomModule.reachability.pathFound';
  }

  switch (verdict) {
    case ReachabilityVerdict.POTENTIALLY_REACHABLE:
      return 'sbomModule.reachability.potential';
    case ReachabilityVerdict.NO_PATH_FOUND:
      return 'sbomModule.reachability.noPathFound';
    case ReachabilityVerdict.UNSUPPORTED:
      return 'sbomModule.reachability.unsupported';
    default:
      return 'unknown';
  }
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

const BLOCKER_LABEL_KEYS: Record<string, string> = {
  TARGET_DATA_MISSING:
    'sbomModule.reachability.blockerLabels.targetDataMissing',
  JNI_REGISTER_NATIVES:
    'sbomModule.reachability.blockerLabels.jniRegisterNatives',
  REFLECTION_METHOD_DYNAMIC:
    'sbomModule.reachability.blockerLabels.reflectionMethodDynamic',
};

export function blockerLabelKey(blocker: string): string | null {
  return BLOCKER_LABEL_KEYS[blocker] ?? null;
}

export function reachabilityWitnessSteps(
  path?: SbomReachabilityWitnessEdge[] | null
): string[] {
  if (!path?.length) {
    return [];
  }

  const [first, ...rest] = path;

  if (!first) {
    return [];
  }

  return [
    first.caller,
    first.callee,
    ...rest.map((edge) => edge.callee),
  ].filter(Boolean);
}
