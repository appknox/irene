import ENUMS from 'irene/enums';

// ─── Types ───────────────────────────────────────────────────────────────────
// Coarse UI status buckets for a dynamic scan — used per scan and for the
// cumulative roll-up across multiple scans (e.g. a multi-role automated scans).
export enum DsStatusGroup {
  NOT_STARTED,
  IN_QUEUE,
  STARTING,
  RUNNING,
  STOPPING,
  COMPLETED,
  ERRORED,
  CANCELLED,
}

// Translation keys mapped 1:1 to each bucket — call `intl.t(...)` on the value.
export type DsStatusLabelKey =
  | 'notStarted'
  | 'inQueue'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'completed'
  | 'errored'
  | 'cancelled';

// ─── Status Group Constants ────────────────────────────────────────────────────
const STATUS = ENUMS.DYNAMIC_SCAN_STATUS;

const RUNNING_STATUSES = new Set([
  STATUS.READY_FOR_INTERACTION,
  STATUS.AUTOPILOT_RUNNING,
  STATUS.AUTOPILOT_COMPLETED,
]);

const STOPPING_STATUSES = new Set([
  STATUS.STOP_SCAN_REQUESTED,
  STATUS.SCAN_TIME_LIMIT_EXCEEDED,
  STATUS.SHUTTING_DOWN,
  STATUS.CLEANING_DEVICE,
  STATUS.RUNTIME_DETECTION_COMPLETED,
]);

const STARTING_STATUSES = new Set([
  STATUS.DEVICE_ALLOCATED,
  STATUS.CONNECTING_TO_DEVICE,
  STATUS.PREPARING_DEVICE,
  STATUS.INSTALLING,
  STATUS.CONFIGURING_API_CAPTURE,
  STATUS.HOOKING,
  STATUS.LAUNCHING,
  STATUS.DOWNLOADING_AUTOPILOT_SCRIPT,
  STATUS.CONFIGURING_AUTOPILOT,
]);

const IN_QUEUE_STATUSES = new Set([
  STATUS.PREPROCESSING,
  STATUS.PROCESSING_SCAN_REQUEST,
  STATUS.IN_QUEUE,
]);

const COMPLETED_STATUSES = new Set([
  STATUS.ANALYZING,
  STATUS.ANALYSIS_COMPLETED,
]);

const ERRORED_STATUSES = new Set([
  STATUS.TIMED_OUT,
  STATUS.ERROR,
  STATUS.TERMINATED,
]);

// Lower number = higher priority. Drives the cumulative roll-up: across
// every role, the bucket with the lowest priority value wins.
export const DS_STATUS_GROUP_PRIORITY = {
  [DsStatusGroup.RUNNING]: 1,
  [DsStatusGroup.STOPPING]: 2,
  [DsStatusGroup.STARTING]: 3,
  [DsStatusGroup.IN_QUEUE]: 4,
  [DsStatusGroup.ERRORED]: 5,
  [DsStatusGroup.COMPLETED]: 6,
  [DsStatusGroup.CANCELLED]: 7,
  [DsStatusGroup.NOT_STARTED]: 8,
};

// Translation key for each bucket — call `intl.t(DS_STATUS_GROUP_LABEL[bucket])`.
export const DS_STATUS_GROUP_LABEL: Record<DsStatusGroup, DsStatusLabelKey> = {
  [DsStatusGroup.NOT_STARTED]: 'notStarted',
  [DsStatusGroup.IN_QUEUE]: 'inQueue',
  [DsStatusGroup.STARTING]: 'starting',
  [DsStatusGroup.RUNNING]: 'running',
  [DsStatusGroup.STOPPING]: 'stopping',
  [DsStatusGroup.COMPLETED]: 'completed',
  [DsStatusGroup.ERRORED]: 'errored',
  [DsStatusGroup.CANCELLED]: 'cancelled',
};

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Maps a single raw `dynamicscan.status` (0–26) to its computed bucket.
 * @param status - The status to map.
 * @returns The computed bucket.
 * @example
 * getDsStatusGroupForScan(STATUS.NOT_STARTED); // DsStatusGroup.NOT_STARTED
 * getDsStatusGroupForScan(STATUS.PREPROCESSING); // DsStatusGroup.IN_QUEUE
 */

export function getDsStatusGroupForScan(status: number) {
  if (STOPPING_STATUSES.has(status)) {
    return DsStatusGroup.STOPPING;
  }

  if (RUNNING_STATUSES.has(status)) {
    return DsStatusGroup.RUNNING;
  }

  if (IN_QUEUE_STATUSES.has(status)) {
    return DsStatusGroup.IN_QUEUE;
  }

  if (STARTING_STATUSES.has(status)) {
    return DsStatusGroup.STARTING;
  }

  if (COMPLETED_STATUSES.has(status)) {
    return DsStatusGroup.COMPLETED;
  }

  if (ERRORED_STATUSES.has(status)) {
    return DsStatusGroup.ERRORED;
  }

  if (status === STATUS.CANCELLED) {
    return DsStatusGroup.CANCELLED;
  }

  return DsStatusGroup.NOT_STARTED;
}

/**
 * Rolls up the per-role buckets across an entire scan group. Empty input
 * is treated as Not Started so callers can pass an empty array safely.
 * @param statuses - The statuses to roll up.
 * @returns The cumulative status.
 * @example
 * getCumulativeDsStatusGroup([STATUS.NOT_STARTED, STATUS.PREPROCESSING]); // DsStatusGroup.IN_QUEUE
 * getCumulativeDsStatusGroup([STATUS.NOT_STARTED, STATUS.PREPROCESSING, STATUS.PROCESSING_SCAN_REQUEST]); // DsStatusGroup.IN_QUEUE
 */

export function getCumulativeDsStatusGroup(statuses: number[]) {
  // If the input is empty, return NOT_STARTED
  if (statuses.length === 0) {
    return DsStatusGroup.NOT_STARTED;
  }

  // Map each status to its bucket and reduce the buckets to the highest priority bucket
  return statuses
    .map(getDsStatusGroupForScan)
    .reduce<DsStatusGroup>(
      (winner, bucket) =>
        DS_STATUS_GROUP_PRIORITY[bucket] < DS_STATUS_GROUP_PRIORITY[winner]
          ? bucket
          : winner,
      DsStatusGroup.NOT_STARTED
    );
}
