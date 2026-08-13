import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import ENUMS from 'irene/enums';

const SCAN_STATUS = ENUMS.OFFSEC_SCAN_STATUS;

module('Unit | Model | offsec-scan', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  // ─── displayName ───────────────────────────────────────────────────────────

  test('displayName prefers the friendly app name', function (assert) {
    const scan = this.store.createRecord('offsec-scan', {
      appName: 'Consumer Banking App',
      packageName: 'com.example.banking',
    });

    assert.strictEqual(scan.displayName, 'Consumer Banking App');
  });

  test('displayName falls back to the package name', function (assert) {
    // The API does not embed app_name yet, so the fallback is the live path.
    const scan = this.store.createRecord('offsec-scan', {
      packageName: 'com.example.banking',
    });

    assert.strictEqual(scan.displayName, 'com.example.banking');
  });

  test('displayName falls back to the scan id when nothing else is set', function (assert) {
    const scan = this.store.createRecord('offsec-scan', { id: '42' });

    assert.strictEqual(scan.displayName, 'scan 42');
  });

  // ─── resilienceClass boundaries ────────────────────────────────────────────

  test('resilienceClass buckets the score at each boundary', function (assert) {
    const cases = [
      { score: 0, expected: 'weak' },
      { score: 39, expected: 'weak' },
      { score: 40, expected: 'medium' },
      { score: 67, expected: 'medium' },
      { score: 79, expected: 'medium' },
      { score: 80, expected: 'strong' },
      { score: 91, expected: 'strong' },
      { score: 94, expected: 'strong' },
      { score: 95, expected: 'very-strong' },
      { score: 100, expected: 'very-strong' },
    ];

    assert.expect(cases.length);

    cases.forEach(({ score, expected }) => {
      const scan = this.store.createRecord('offsec-scan', {
        overallResilience: score,
      });

      assert.strictEqual(
        scan.resilienceClass,
        expected,
        `${score} is ${expected}`
      );
    });
  });

  test('resilienceClass is unknown without a score', function (assert) {
    const scan = this.store.createRecord('offsec-scan', {
      overallResilience: null,
    });

    assert.strictEqual(scan.resilienceClass, 'unknown');
  });

  test('resilienceClass ignores the API band', function (assert) {
    // The band vocabulary (very_strong) does not match the derived one, so the
    // score must win or the pill's number and word could disagree.
    const scan = this.store.createRecord('offsec-scan', {
      overallResilience: 40,
      resilienceBand: 'very_strong',
    });

    assert.strictEqual(scan.resilienceClass, 'medium');
  });

  // ─── protectionsResisted ───────────────────────────────────────────────────

  test('protectionsResisted is what was assessed but not bypassed', function (assert) {
    const scan = this.store.createRecord('offsec-scan', {
      protectionsDetected: 10,
      protectionsBypassed: 2,
      findingsAssessed: 6,
      findingsUnassessed: 4,
    });

    assert.strictEqual(scan.protectionsResisted, 4);
  });

  test('protectionsResisted is zero when everything was bypassed', function (assert) {
    const scan = this.store.createRecord('offsec-scan', {
      protectionsBypassed: 6,
      findingsAssessed: 6,
    });

    assert.strictEqual(scan.protectionsResisted, 0);
  });

  test('protectionsResisted clamps instead of going negative', function (assert) {
    // A half-synced run can report more bypasses than it has assessed findings.
    const scan = this.store.createRecord('offsec-scan', {
      protectionsBypassed: 4,
      findingsAssessed: 1,
    });

    assert.strictEqual(scan.protectionsResisted, 0);
  });

  test('protectionsResisted is zero when the counters are absent', function (assert) {
    const scan = this.store.createRecord('offsec-scan', {});

    assert.strictEqual(scan.protectionsResisted, 0);
  });

  // ─── hasResilience ─────────────────────────────────────────────────────────

  test('hasResilience is true only for a completed scoring run', function (assert) {
    const completed = this.store.createRecord('offsec-scan', {
      status: SCAN_STATUS.COMPLETED,
      overallResilience: 67,
    });

    const running = this.store.createRecord('offsec-scan', {
      status: SCAN_STATUS.RUNNING,
      overallResilience: 67,
    });

    const unscored = this.store.createRecord('offsec-scan', {
      status: SCAN_STATUS.COMPLETED,
      overallResilience: null,
    });

    assert.true(completed.hasResilience);
    assert.false(running.hasResilience);
    assert.false(unscored.hasResilience);
  });

  // ─── Date ──────────────────────────────────────────────────────────────────

  test('scannedOn prefers completedAt and drives the label', function (assert) {
    const scan = this.store.createRecord('offsec-scan', {
      createdAt: new Date('2026-06-18T09:00:00Z'),
      completedAt: new Date('2026-07-02T10:00:00Z'),
    });

    assert.strictEqual(scan.scannedOn.getTime(), scan.completedAt.getTime());
    assert.strictEqual(scan.scannedOnLabel, '02-07-2026');
  });

  test('scannedOn falls back to createdAt', function (assert) {
    const scan = this.store.createRecord('offsec-scan', {
      createdAt: new Date('2026-06-18T09:00:00Z'),
      completedAt: null,
    });

    assert.strictEqual(scan.scannedOn.getTime(), scan.createdAt.getTime());
    assert.strictEqual(scan.scannedOnLabel, '18-06-2026');
  });

  test('scannedOnLabel is a dash with no dates at all', function (assert) {
    const scan = this.store.createRecord('offsec-scan', {
      createdAt: null,
      completedAt: null,
    });

    assert.strictEqual(scan.scannedOnLabel, '-');
  });
});
