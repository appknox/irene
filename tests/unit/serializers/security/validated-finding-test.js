import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import { UNKNOWN_SCALE_VALUE } from 'irene/utils/knoxiq-validated-findings';

module('Unit | Serializer | security/validated-finding', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');

    this.serializeFinding = (attrs = {}) => {
      const record = this.server.create('security/validated-finding', attrs);

      const finding = this.store.push(
        this.store.normalize('security/validated-finding', record.toJSON())
      );

      return finding.serialize();
    };
  });

  // ─── Write shape ───────────────────────────────────────────────────────────

  test('it writes the flat fields the API accepts', function (assert) {
    const payload = this.serializeFinding({
      validation: {
        confidence_label: 'MEDIUM',
        finding_summary: 'A summary',
        evidence: ['A line'],
        reasoning: 'Reasoning',
      },
      remediation: { steps: ['Fix it'] },
      poc: {
        verification_steps: [
          { step_number: 1, title: 'Open', expected_result: 'Launches' },
        ],
      },
      exploitability: {
        exploitability_likelihood: 'High',
        exploitability_analysis: { summary: 'Analysis' },
      },
    });

    assert.strictEqual(payload.confidence, 2);
    assert.strictEqual(payload.summary, 'A summary');
    assert.deepEqual(payload.evidence, ['A line']);
    assert.strictEqual(payload.reasoning, 'Reasoning');
    assert.deepEqual(payload.remediation_steps, [
      { heading: '', body: 'Fix it' },
    ]);
    assert.deepEqual(payload.steps_to_reproduce, [
      { heading: 'Open', body: 'Launches' },
    ]);
    assert.strictEqual(payload.exploitability_likelihood, 3);
    assert.strictEqual(payload.exploitability_analysis, 'Analysis');
  });

  test('it never sends the nested read shape', function (assert) {
    assert.expect(4);

    const payload = this.serializeFinding();

    ['validation', 'remediation', 'poc', 'exploitability'].forEach((key) => {
      assert.notOk(key in payload, `${key} is not sent`);
    });
  });

  test('it never sends the read-only identifiers', function (assert) {
    assert.expect(6);

    const payload = this.serializeFinding();

    [
      'id',
      'finding_id',
      'scan_id',
      'scan_type',
      'title',
      'description',
    ].forEach((key) => {
      assert.notOk(key in payload, `${key} is not sent`);
    });
  });

  test('it never sends the client-only step id', function (assert) {
    const payload = this.serializeFinding({
      remediation: { steps: [{ heading: 'Fix', body: 'Do it' }] },
      poc: {
        verification_steps: [
          { step_number: 1, title: 'Open', expected_result: 'Launches' },
        ],
      },
    });

    assert.notOk('id' in payload.remediation_steps[0]);
    assert.notOk('id' in payload.steps_to_reproduce[0]);
  });

  // ─── Empty finding ─────────────────────────────────────────────────────────

  test('a finding with no AI content serializes to empty values', function (assert) {
    const payload = this.serializeFinding({
      validation: { evidence: [] },
      remediation: { steps: [] },
      poc: { verification_steps: [] },
      exploitability: {},
    });

    assert.strictEqual(payload.confidence, UNKNOWN_SCALE_VALUE);
    assert.strictEqual(payload.summary, '');
    assert.deepEqual(payload.evidence, []);
    assert.strictEqual(payload.reasoning, '');
    assert.deepEqual(payload.remediation_steps, []);
    assert.deepEqual(payload.steps_to_reproduce, []);
    assert.strictEqual(payload.exploitability_likelihood, UNKNOWN_SCALE_VALUE);
    assert.strictEqual(payload.exploitability_analysis, '');
  });
});
