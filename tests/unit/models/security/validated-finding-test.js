import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import { UNKNOWN_SCALE_VALUE } from 'irene/utils/knoxiq-validated-findings';

module('Unit | Model | security/validated-finding', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');

    this.pushFinding = (attrs = {}) => {
      const record = this.server.create('security/validated-finding', attrs);

      return this.store.push(
        this.store.normalize('security/validated-finding', record.toJSON())
      );
    };
  });

  // ─── Validation getters ────────────────────────────────────────────────────

  test.each(
    'confidence reads the stored label',
    [
      ['HIGH', 3],
      ['MEDIUM', 2],
      ['LOW', 1],
      ['UNKNOWN', UNKNOWN_SCALE_VALUE],
    ],
    function (assert, [confidence_label, expected]) {
      const finding = this.pushFinding({
        validation: { confidence_label, evidence: [] },
      });

      assert.strictEqual(finding.confidence, expected);
    }
  );

  test('summary reads the finding summary', function (assert) {
    const finding = this.pushFinding({
      validation: { finding_summary: 'A short summary', evidence: [] },
    });

    assert.strictEqual(finding.summary, 'A short summary');
  });

  test('reasoning reads the stored reasoning', function (assert) {
    const finding = this.pushFinding({
      validation: { reasoning: '<p>Because of this</p>', evidence: [] },
    });

    assert.strictEqual(finding.reasoning, '<p>Because of this</p>');
  });

  test('evidenceHtml renders the stored lines as a list', function (assert) {
    const finding = this.pushFinding({
      validation: { evidence: ['First', 'Second'] },
    });

    assert.strictEqual(
      finding.evidenceHtml,
      '<ul><li><p>First</p></li><li><p>Second</p></li></ul>'
    );
  });

  test('evidenceHtml is empty when nothing is stored', function (assert) {
    const finding = this.pushFinding({ validation: { evidence: [] } });

    assert.strictEqual(finding.evidenceHtml, '');
  });

  // ─── Step getters ──────────────────────────────────────────────────────────

  test('remediationSteps reads the AI string shape', function (assert) {
    const finding = this.pushFinding({
      remediation: { steps: ['Disable the flag'] },
    });

    assert.strictEqual(finding.remediationSteps.length, 1);
    assert.strictEqual(finding.remediationSteps[0].heading, '');
    assert.strictEqual(finding.remediationSteps[0].body, 'Disable the flag');
  });

  test('remediationSteps reads the edited object shape', function (assert) {
    const finding = this.pushFinding({
      remediation: { steps: [{ heading: 'Step one', body: 'Do it' }] },
    });

    assert.strictEqual(finding.remediationSteps[0].heading, 'Step one');
    assert.strictEqual(finding.remediationSteps[0].body, 'Do it');
  });

  test('stepsToReproduce maps verification steps onto editor steps', function (assert) {
    const finding = this.pushFinding({
      poc: {
        verification_steps: [
          { step_number: 1, title: 'Open', expected_result: 'It launches' },
        ],
      },
    });

    assert.strictEqual(finding.stepsToReproduce.length, 1);
    assert.strictEqual(finding.stepsToReproduce[0].heading, 'Open');
    assert.strictEqual(finding.stepsToReproduce[0].body, 'It launches');
  });

  test.each(
    'step getters are empty when nothing is stored',
    [
      ['remediationSteps', { remediation: { steps: [] } }],
      ['stepsToReproduce', { poc: { verification_steps: [] } }],
    ],
    function (assert, [getter, attrs]) {
      assert.deepEqual(this.pushFinding(attrs)[getter], []);
    }
  );

  // ─── Exploitability getters ────────────────────────────────────────────────

  test.each(
    'exploitabilityLikelihood reads the stored label',
    [
      ['High', 3],
      ['Medium', 2],
      ['Low', 1],
      ['Unknown', UNKNOWN_SCALE_VALUE],
    ],
    function (assert, [exploitability_likelihood, expected]) {
      const finding = this.pushFinding({
        exploitability: { exploitability_likelihood },
      });

      assert.strictEqual(finding.exploitabilityLikelihood, expected);
    }
  );

  test('exploitabilityAnalysis reads the analysis summary', function (assert) {
    const finding = this.pushFinding({
      exploitability: {
        exploitability_analysis: { summary: 'Reachable remotely' },
      },
    });

    assert.strictEqual(finding.exploitabilityAnalysis, 'Reachable remotely');
  });

  test('exploitabilityAnalysis is empty when nothing is stored', function (assert) {
    const finding = this.pushFinding({ exploitability: {} });

    assert.strictEqual(finding.exploitabilityAnalysis, '');
  });

  // ─── Content ───────────────────────────────────────────────────────────────

  test('content flattens every blob into the editor shape', function (assert) {
    const finding = this.pushFinding({
      validation: {
        confidence_label: 'LOW',
        finding_summary: 'Summary',
        evidence: ['Line'],
        reasoning: 'Reasoning',
      },
      remediation: { steps: ['Fix it'] },
      poc: {
        verification_steps: [
          { step_number: 1, title: 'Open', expected_result: 'Launches' },
        ],
      },
      exploitability: {
        exploitability_likelihood: 'Medium',
        exploitability_analysis: { summary: 'Analysis' },
      },
    });

    assert.strictEqual(finding.content.confidence, 1);
    assert.strictEqual(finding.content.summary, 'Summary');
    assert.deepEqual(finding.content.evidence, ['Line']);
    assert.strictEqual(finding.content.reasoning, 'Reasoning');
    assert.strictEqual(finding.content.remediationSteps[0].body, 'Fix it');
    assert.strictEqual(finding.content.stepsToReproduce[0].heading, 'Open');
    assert.strictEqual(finding.content.exploitabilityLikelihood, 2);
    assert.strictEqual(finding.content.exploitabilityAnalysis, 'Analysis');
  });
});
