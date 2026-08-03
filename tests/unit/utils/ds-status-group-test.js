import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import {
  DS_STATUS_GROUP_LABEL,
  DS_STATUS_GROUP_PRIORITY,
  DsStatusGroup,
  getDsStatusGroupForScan,
  getCumulativeDsStatusGroup,
} from 'irene/utils/ds-status-group';

const STATUS = ENUMS.DYNAMIC_SCAN_STATUS;
const STATUS_GROUP = DsStatusGroup;

module('Unit | Utility | ds-status-group', function () {
  // ─── Per-scan bucket mapping ────────────────────────────────────────────────

  test.each(
    'maps a single status ID to its computed bucket (Table 1)',
    [
      [STATUS.NOT_STARTED, STATUS_GROUP.NOT_STARTED],
      [STATUS.PREPROCESSING, STATUS_GROUP.IN_QUEUE],
      [STATUS.PROCESSING_SCAN_REQUEST, STATUS_GROUP.IN_QUEUE],
      [STATUS.IN_QUEUE, STATUS_GROUP.IN_QUEUE],
      [STATUS.DEVICE_ALLOCATED, STATUS_GROUP.STARTING],
      [STATUS.CONNECTING_TO_DEVICE, STATUS_GROUP.STARTING],
      [STATUS.PREPARING_DEVICE, STATUS_GROUP.STARTING],
      [STATUS.INSTALLING, STATUS_GROUP.STARTING],
      [STATUS.CONFIGURING_API_CAPTURE, STATUS_GROUP.STARTING],
      [STATUS.HOOKING, STATUS_GROUP.STARTING],
      [STATUS.LAUNCHING, STATUS_GROUP.STARTING],
      [STATUS.READY_FOR_INTERACTION, STATUS_GROUP.RUNNING],
      [STATUS.DOWNLOADING_AUTOPILOT_SCRIPT, STATUS_GROUP.STARTING],
      [STATUS.CONFIGURING_AUTOPILOT, STATUS_GROUP.STARTING],
      [STATUS.AUTOPILOT_RUNNING, STATUS_GROUP.RUNNING],
      [STATUS.AUTOPILOT_COMPLETED, STATUS_GROUP.RUNNING],
      [STATUS.STOP_SCAN_REQUESTED, STATUS_GROUP.STOPPING],
      [STATUS.SCAN_TIME_LIMIT_EXCEEDED, STATUS_GROUP.STOPPING],
      [STATUS.SHUTTING_DOWN, STATUS_GROUP.STOPPING],
      [STATUS.CLEANING_DEVICE, STATUS_GROUP.STOPPING],
      [STATUS.RUNTIME_DETECTION_COMPLETED, STATUS_GROUP.STOPPING],
      [STATUS.ANALYZING, STATUS_GROUP.COMPLETED],
      [STATUS.ANALYSIS_COMPLETED, STATUS_GROUP.COMPLETED],
      [STATUS.TIMED_OUT, STATUS_GROUP.ERRORED],
      [STATUS.ERROR, STATUS_GROUP.ERRORED],
      [STATUS.CANCELLED, STATUS_GROUP.CANCELLED],
      [STATUS.TERMINATED, STATUS_GROUP.ERRORED],
      [STATUS.RETRYING, STATUS_GROUP.RETRYING],
    ],
    function (assert, [status, expected]) {
      assert.strictEqual(
        getDsStatusGroupForScan(status),
        expected,
        `status ${status} → ${expected}`
      );
    }
  );

  test('falls back to NOT_STARTED for an unknown status code', function (assert) {
    assert.strictEqual(getDsStatusGroupForScan(-1), STATUS_GROUP.NOT_STARTED);
    assert.strictEqual(getDsStatusGroupForScan(999), STATUS_GROUP.NOT_STARTED);
  });

  // ─── Cumulative — empty / single role ───────────────────────────────────────

  test('returns NOT_STARTED for an empty status list', function (assert) {
    assert.strictEqual(
      getCumulativeDsStatusGroup([]),
      STATUS_GROUP.NOT_STARTED
    );
  });

  test.each(
    'cumulative for a single role mirrors the per-scan mapping (Table 3)',
    [
      [STATUS.NOT_STARTED, STATUS_GROUP.NOT_STARTED],
      [STATUS.PREPROCESSING, STATUS_GROUP.IN_QUEUE],
      [STATUS.IN_QUEUE, STATUS_GROUP.IN_QUEUE],
      [STATUS.INSTALLING, STATUS_GROUP.STARTING],
      [STATUS.DOWNLOADING_AUTOPILOT_SCRIPT, STATUS_GROUP.STARTING],
      [STATUS.CONFIGURING_AUTOPILOT, STATUS_GROUP.STARTING],
      [STATUS.READY_FOR_INTERACTION, STATUS_GROUP.RUNNING],
      [STATUS.AUTOPILOT_RUNNING, STATUS_GROUP.RUNNING],
      [STATUS.AUTOPILOT_COMPLETED, STATUS_GROUP.RUNNING],
      [STATUS.STOP_SCAN_REQUESTED, STATUS_GROUP.STOPPING],
      [STATUS.SHUTTING_DOWN, STATUS_GROUP.STOPPING],
      [STATUS.RUNTIME_DETECTION_COMPLETED, STATUS_GROUP.STOPPING],
      [STATUS.ANALYZING, STATUS_GROUP.COMPLETED],
      [STATUS.ANALYSIS_COMPLETED, STATUS_GROUP.COMPLETED],
      [STATUS.TIMED_OUT, STATUS_GROUP.ERRORED],
      [STATUS.ERROR, STATUS_GROUP.ERRORED],
      [STATUS.TERMINATED, STATUS_GROUP.ERRORED],
      [STATUS.CANCELLED, STATUS_GROUP.CANCELLED],
      [STATUS.RETRYING, STATUS_GROUP.RETRYING],
    ],
    function (assert, [status, expected]) {
      assert.strictEqual(
        getCumulativeDsStatusGroup([status]),
        expected,
        `[${status}] → ${expected}`
      );
    }
  );

  // ─── Cumulative — two roles ───────────────────────────────────────

  test.each(
    'rolls up two roles into the cumulative bucket',
    [
      [[STATUS.NOT_STARTED, STATUS.NOT_STARTED], STATUS_GROUP.NOT_STARTED],
      [[STATUS.IN_QUEUE, STATUS.NOT_STARTED], STATUS_GROUP.IN_QUEUE],
      [[STATUS.PREPROCESSING, STATUS.IN_QUEUE], STATUS_GROUP.IN_QUEUE],
      [[STATUS.INSTALLING, STATUS.IN_QUEUE], STATUS_GROUP.STARTING],
      [
        [STATUS.DEVICE_ALLOCATED, STATUS.PREPARING_DEVICE],
        STATUS_GROUP.STARTING,
      ],
      [[STATUS.AUTOPILOT_RUNNING, STATUS.NOT_STARTED], STATUS_GROUP.RUNNING],
      [[STATUS.AUTOPILOT_RUNNING, STATUS.IN_QUEUE], STATUS_GROUP.RUNNING],
      [[STATUS.AUTOPILOT_RUNNING, STATUS.INSTALLING], STATUS_GROUP.RUNNING],
      [
        [STATUS.READY_FOR_INTERACTION, STATUS.AUTOPILOT_RUNNING],
        STATUS_GROUP.RUNNING,
      ],
      // Running outranks Stopping in the same group.
      [[STATUS.AUTOPILOT_RUNNING, STATUS.SHUTTING_DOWN], STATUS_GROUP.RUNNING],
      [
        [STATUS.AUTOPILOT_RUNNING, STATUS.ANALYSIS_COMPLETED],
        STATUS_GROUP.RUNNING,
      ],
      [[STATUS.AUTOPILOT_RUNNING, STATUS.ERROR], STATUS_GROUP.RUNNING],
      [[STATUS.SHUTTING_DOWN, STATUS.NOT_STARTED], STATUS_GROUP.STOPPING],
      [[STATUS.SHUTTING_DOWN, STATUS.IN_QUEUE], STATUS_GROUP.STOPPING],
      [[STATUS.SHUTTING_DOWN, STATUS.INSTALLING], STATUS_GROUP.STOPPING],
      [
        [STATUS.STOP_SCAN_REQUESTED, STATUS.RUNTIME_DETECTION_COMPLETED],
        STATUS_GROUP.STOPPING,
      ],
      [
        [STATUS.SHUTTING_DOWN, STATUS.ANALYSIS_COMPLETED],
        STATUS_GROUP.STOPPING,
      ],
      [[STATUS.SHUTTING_DOWN, STATUS.ERROR], STATUS_GROUP.STOPPING],
      [[STATUS.INSTALLING, STATUS.ANALYSIS_COMPLETED], STATUS_GROUP.STARTING],
      [[STATUS.IN_QUEUE, STATUS.ANALYSIS_COMPLETED], STATUS_GROUP.IN_QUEUE],
      [[STATUS.ANALYSIS_COMPLETED, STATUS.NOT_STARTED], STATUS_GROUP.COMPLETED],
      [
        [STATUS.ANALYSIS_COMPLETED, STATUS.ANALYSIS_COMPLETED],
        STATUS_GROUP.COMPLETED,
      ],
      // Errored beats Completed when both are present.
      [[STATUS.ANALYSIS_COMPLETED, STATUS.ERROR], STATUS_GROUP.ERRORED],
      [[STATUS.ERROR, STATUS.NOT_STARTED], STATUS_GROUP.ERRORED],
      [[STATUS.ERROR, STATUS.ERROR], STATUS_GROUP.ERRORED],
      [[STATUS.TIMED_OUT, STATUS.TERMINATED], STATUS_GROUP.ERRORED],
    ],
    function (assert, [statuses, expected]) {
      assert.strictEqual(
        getCumulativeDsStatusGroup(statuses),
        expected,
        `${JSON.stringify(statuses)} → ${expected}`
      );
    }
  );

  // ─── Cumulative — three roles ─────────────────────────────────────

  test.each(
    'rolls up three roles into the cumulative bucket',
    [
      [
        [STATUS.NOT_STARTED, STATUS.NOT_STARTED, STATUS.NOT_STARTED],
        STATUS_GROUP.NOT_STARTED,
      ],
      [
        [STATUS.IN_QUEUE, STATUS.NOT_STARTED, STATUS.NOT_STARTED],
        STATUS_GROUP.IN_QUEUE,
      ],
      [
        [STATUS.INSTALLING, STATUS.IN_QUEUE, STATUS.NOT_STARTED],
        STATUS_GROUP.STARTING,
      ],
      [
        [STATUS.AUTOPILOT_RUNNING, STATUS.IN_QUEUE, STATUS.NOT_STARTED],
        STATUS_GROUP.RUNNING,
      ],
      [
        [STATUS.AUTOPILOT_RUNNING, STATUS.INSTALLING, STATUS.IN_QUEUE],
        STATUS_GROUP.RUNNING,
      ],
      [
        [
          STATUS.AUTOPILOT_RUNNING,
          STATUS.AUTOPILOT_RUNNING,
          STATUS.NOT_STARTED,
        ],
        STATUS_GROUP.RUNNING,
      ],
      [
        [
          STATUS.AUTOPILOT_RUNNING,
          STATUS.AUTOPILOT_RUNNING,
          STATUS.AUTOPILOT_RUNNING,
        ],
        STATUS_GROUP.RUNNING,
      ],
      [
        [
          STATUS.AUTOPILOT_RUNNING,
          STATUS.SHUTTING_DOWN,
          STATUS.ANALYSIS_COMPLETED,
        ],
        STATUS_GROUP.RUNNING,
      ],
      [
        [
          STATUS.READY_FOR_INTERACTION,
          STATUS.AUTOPILOT_COMPLETED,
          STATUS.AUTOPILOT_RUNNING,
        ],
        STATUS_GROUP.RUNNING,
      ],
      [
        [STATUS.SHUTTING_DOWN, STATUS.SHUTTING_DOWN, STATUS.NOT_STARTED],
        STATUS_GROUP.STOPPING,
      ],
      [
        [
          STATUS.RUNTIME_DETECTION_COMPLETED,
          STATUS.ANALYSIS_COMPLETED,
          STATUS.ANALYSIS_COMPLETED,
        ],
        STATUS_GROUP.STOPPING,
      ],
      [
        [
          STATUS.DEVICE_ALLOCATED,
          STATUS.PREPARING_DEVICE,
          STATUS.CONFIGURING_AUTOPILOT,
        ],
        STATUS_GROUP.STARTING,
      ],
      [
        [STATUS.PREPROCESSING, STATUS.PROCESSING_SCAN_REQUEST, STATUS.IN_QUEUE],
        STATUS_GROUP.IN_QUEUE,
      ],
      [
        [
          STATUS.ANALYSIS_COMPLETED,
          STATUS.ANALYSIS_COMPLETED,
          STATUS.ANALYSIS_COMPLETED,
        ],
        STATUS_GROUP.COMPLETED,
      ],
      [
        [
          STATUS.ANALYSIS_COMPLETED,
          STATUS.ANALYSIS_COMPLETED,
          STATUS.NOT_STARTED,
        ],
        STATUS_GROUP.COMPLETED,
      ],
      [
        [STATUS.ANALYSIS_COMPLETED, STATUS.ERROR, STATUS.ERROR],
        STATUS_GROUP.ERRORED,
      ],
      [[STATUS.ERROR, STATUS.ERROR, STATUS.ERROR], STATUS_GROUP.ERRORED],
      [
        [STATUS.ANALYZING, STATUS.ANALYSIS_COMPLETED, STATUS.ERROR],
        STATUS_GROUP.ERRORED,
      ],
      [
        [
          STATUS.AUTOPILOT_RUNNING,
          STATUS.ANALYSIS_COMPLETED,
          STATUS.ANALYSIS_COMPLETED,
        ],
        STATUS_GROUP.RUNNING,
      ],
      [
        [STATUS.SHUTTING_DOWN, STATUS.ANALYSIS_COMPLETED, STATUS.ERROR],
        STATUS_GROUP.STOPPING,
      ],
    ],
    function (assert, [statuses, expected]) {
      assert.strictEqual(
        getCumulativeDsStatusGroup(statuses),
        expected,
        `${JSON.stringify(statuses)} → ${expected}`
      );
    }
  );

  // ─── Cumulative — Cancelled edge cases ───────────────

  test.each(
    'cancelled is preserved only when no higher-priority bucket is present',
    [
      [
        [STATUS.CANCELLED, STATUS.CANCELLED, STATUS.CANCELLED],
        STATUS_GROUP.CANCELLED,
      ],
      [[STATUS.CANCELLED, STATUS.NOT_STARTED], STATUS_GROUP.CANCELLED],
      // Any active state outranks cancelled.
      [[STATUS.CANCELLED, STATUS.AUTOPILOT_RUNNING], STATUS_GROUP.RUNNING],
      [[STATUS.CANCELLED, STATUS.SHUTTING_DOWN], STATUS_GROUP.STOPPING],
      [[STATUS.CANCELLED, STATUS.INSTALLING], STATUS_GROUP.STARTING],
      [[STATUS.CANCELLED, STATUS.IN_QUEUE], STATUS_GROUP.IN_QUEUE],
      // Errored / Completed also outrank Cancelled.
      [[STATUS.CANCELLED, STATUS.ERROR], STATUS_GROUP.ERRORED],
      [[STATUS.CANCELLED, STATUS.ANALYSIS_COMPLETED], STATUS_GROUP.COMPLETED],
    ],
    function (assert, [statuses, expected]) {
      assert.strictEqual(
        getCumulativeDsStatusGroup(statuses),
        expected,
        `${JSON.stringify(statuses)} → ${expected}`
      );
    }
  );

  // ─── RETRYING roll-up ────────────────────────────────────────────────────────

  test.each(
    'RETRYING is outranked by RUNNING/STOPPING and outranks lower buckets',
    [
      // Active states beat RETRYING.
      [[STATUS.AUTOPILOT_RUNNING, STATUS.RETRYING], STATUS_GROUP.RUNNING],
      [[STATUS.READY_FOR_INTERACTION, STATUS.RETRYING], STATUS_GROUP.RUNNING],
      [[STATUS.SHUTTING_DOWN, STATUS.RETRYING], STATUS_GROUP.STOPPING],
      // RETRYING beats everything below priority 3.
      [[STATUS.RETRYING, STATUS.IN_QUEUE], STATUS_GROUP.RETRYING],
      [[STATUS.RETRYING, STATUS.NOT_STARTED], STATUS_GROUP.RETRYING],
      [[STATUS.RETRYING, STATUS.ANALYSIS_COMPLETED], STATUS_GROUP.RETRYING],
      [[STATUS.RETRYING, STATUS.ERROR], STATUS_GROUP.RETRYING],
      [[STATUS.RETRYING, STATUS.CANCELLED], STATUS_GROUP.RETRYING],
    ],
    function (assert, [statuses, expected]) {
      assert.strictEqual(
        getCumulativeDsStatusGroup(statuses),
        expected,
        `${JSON.stringify(statuses)} → ${expected}`
      );
    }
  );

  // ─── Priority + label exports ───────────────────────────────────────────────

  test('priority order matches the cumulative spec', function (assert) {
    assert.true(
      DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.RUNNING] <
        DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.STOPPING],
      'running beats stopping'
    );
    assert.true(
      DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.STOPPING] <
        DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.STARTING],
      'stopping beats starting'
    );

    assert.true(
      DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.STOPPING] <
        DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.RETRYING],
      'stopping beats retrying'
    );

    assert.strictEqual(
      DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.RETRYING],
      DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.STARTING],
      'retrying ties with starting (intentional)'
    );

    assert.true(
      DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.RETRYING] <
        DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.IN_QUEUE],
      'retrying beats in_queue'
    );

    assert.true(
      DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.STARTING] <
        DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.IN_QUEUE],
      'starting beats in_queue'
    );

    assert.true(
      DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.IN_QUEUE] <
        DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.ERRORED],
      'in_queue (active) beats errored (terminal)'
    );

    assert.true(
      DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.ERRORED] <
        DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.COMPLETED],
      'errored beats completed when both present'
    );

    assert.true(
      DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.COMPLETED] <
        DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.CANCELLED],
      'completed beats cancelled'
    );

    assert.true(
      DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.CANCELLED] <
        DS_STATUS_GROUP_PRIORITY[STATUS_GROUP.NOT_STARTED],
      'cancelled beats not_started'
    );
  });

  test('every bucket has a label and a priority entry', function (assert) {
    const buckets = [
      STATUS_GROUP.NOT_STARTED,
      STATUS_GROUP.IN_QUEUE,
      STATUS_GROUP.STARTING,
      STATUS_GROUP.RETRYING,
      STATUS_GROUP.RUNNING,
      STATUS_GROUP.STOPPING,
      STATUS_GROUP.COMPLETED,
      STATUS_GROUP.ERRORED,
      STATUS_GROUP.CANCELLED,
    ];

    assert.expect(buckets.length * 3);

    buckets.forEach((bucket) => {
      assert.strictEqual(
        typeof DS_STATUS_GROUP_LABEL[bucket],
        'string',
        `bucket ${bucket} label is a string`
      );

      assert.true(
        DS_STATUS_GROUP_LABEL[bucket].length > 0,
        `bucket ${bucket} label is non-empty`
      );

      assert.strictEqual(
        typeof DS_STATUS_GROUP_PRIORITY[bucket],
        'number',
        `bucket ${bucket} has a numeric priority`
      );
    });
  });

  test('exactly one priority tie exists: RETRYING shares rank with STARTING', function (assert) {
    const allPriorities = Object.values(DS_STATUS_GROUP_PRIORITY);
    const uniquePriorities = new Set(allPriorities);

    // Every bucket has a priority, and the only intentional tie is
    // RETRYING == STARTING (both rank equivalently in the roll-up).
    assert.strictEqual(
      allPriorities.length - uniquePriorities.size,
      1,
      'exactly one priority is shared (RETRYING and STARTING)'
    );
  });

  // ─── Determinism + invariants ───────────────────────────────────────────────

  test('cumulative result is independent of input order', function (assert) {
    const cases = [
      [STATUS.AUTOPILOT_RUNNING, STATUS.SHUTTING_DOWN, STATUS.NOT_STARTED],
      [STATUS.ANALYSIS_COMPLETED, STATUS.ERROR, STATUS.NOT_STARTED],
      [STATUS.INSTALLING, STATUS.IN_QUEUE, STATUS.PREPROCESSING],
    ];

    assert.expect(cases.length);

    cases.forEach((statuses) => {
      const forward = getCumulativeDsStatusGroup(statuses);
      const reverse = getCumulativeDsStatusGroup([...statuses].reverse());

      assert.strictEqual(
        reverse,
        forward,
        `order-independent for ${JSON.stringify(statuses)}`
      );
    });
  });

  test('input array is not mutated', function (assert) {
    const input = [
      STATUS.AUTOPILOT_RUNNING,
      STATUS.SHUTTING_DOWN,
      STATUS.NOT_STARTED,
    ];

    const snapshot = [...input];

    getCumulativeDsStatusGroup(input);

    assert.deepEqual(input, snapshot, 'input array is left intact');
  });
});
