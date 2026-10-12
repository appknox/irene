import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import {
  CONFIDENCE_LABELS,
  buildExploitability,
  buildPoc,
  buildRemediation,
  buildValidation,
  CONFIDENCE_VALUES,
  EXPLOITABILITY_LIKELIHOOD_LABELS,
  EXPLOITABILITY_LIKELIHOOD_VALUES,
  UNKNOWN_SCALE_VALUE,
  buildStepId,
  confidenceFromLabel,
  evidenceFromHtml,
  evidenceToHtml,
  toValidatedFindingContent,
  likelihoodFromLabel,
  normalizeRemediationSteps,
  normalizeVerificationSteps,
  toValidatedFindingPayload,
} from 'irene/utils/knoxiq-validated-findings';

module('Unit | Utility | manual-validated-findings', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const finding = this.server.create('security/validated-finding', {
      validation: {
        verdict: 'valid',
        is_valid: true,
        confidence: 0.9,
        confidence_label: 'HIGH',
        finding_summary: 'Original summary',
        evidence: ['Original evidence'],
        reasoning: 'Original reasoning',
        false_positive_indicators: ['None found'],
        is_third_party: false,
        library_origin: null,
      },
    });

    this.setProperties({
      validation: finding.validation,
      remediation: finding.remediation,
      poc: finding.poc,
      exploitability: finding.exploitability,
    });
  });

  // ─── Scale labels ──────────────────────────────────────────────────────────

  test('it mirrors the backend confidence scale', function (assert) {
    assert.deepEqual(CONFIDENCE_LABELS, {
      3: 'HIGH',
      2: 'MEDIUM',
      1: 'LOW',
      [UNKNOWN_SCALE_VALUE]: 'UNKNOWN',
    });

    assert.deepEqual([...CONFIDENCE_VALUES], [3, 2, 1]);
  });

  test('it mirrors the backend exploitability likelihood scale', function (assert) {
    assert.deepEqual(EXPLOITABILITY_LIKELIHOOD_LABELS, {
      3: 'High',
      2: 'Medium',
      1: 'Low',
      [UNKNOWN_SCALE_VALUE]: 'Unknown',
    });

    assert.deepEqual([...EXPLOITABILITY_LIKELIHOOD_VALUES], [3, 2, 1]);
  });

  test.each(
    'confidenceFromLabel maps every label and casing to its value',
    [
      ['HIGH', 3],
      ['High', 3],
      ['medium', 2],
      ['LOW', 1],
      ['UNKNOWN', UNKNOWN_SCALE_VALUE],
      ['nonsense', UNKNOWN_SCALE_VALUE],
      ['', UNKNOWN_SCALE_VALUE],
      [null, UNKNOWN_SCALE_VALUE],
      [undefined, UNKNOWN_SCALE_VALUE],
    ],
    function (assert, [label, expected]) {
      assert.strictEqual(confidenceFromLabel(label), expected);
    }
  );

  test.each(
    'likelihoodFromLabel maps every label and casing to its value',
    [
      ['High', 3],
      ['HIGH', 3],
      ['medium', 2],
      ['Low', 1],
      ['Unknown', UNKNOWN_SCALE_VALUE],
      ['critical', UNKNOWN_SCALE_VALUE],
      ['', UNKNOWN_SCALE_VALUE],
      [null, UNKNOWN_SCALE_VALUE],
      [undefined, UNKNOWN_SCALE_VALUE],
    ],
    function (assert, [label, expected]) {
      assert.strictEqual(likelihoodFromLabel(label), expected);
    }
  );

  // ─── Step normalization ────────────────────────────────────────────────────

  test('normalizeRemediationSteps reads the AI string shape', function (assert) {
    const steps = normalizeRemediationSteps(['Set debug to false']);

    assert.strictEqual(steps.length, 1);
    assert.strictEqual(steps[0].heading, '');
    assert.strictEqual(steps[0].body, 'Set debug to false');
    assert.strictEqual(typeof steps[0].id, 'number');
  });

  test('normalizeRemediationSteps reads the edited object shape', function (assert) {
    const steps = normalizeRemediationSteps([
      { heading: 'Disable debugging', body: '<p>Set the flag</p>', id: 7 },
    ]);

    assert.strictEqual(steps.length, 1);
    assert.strictEqual(steps[0].heading, 'Disable debugging');
    assert.strictEqual(steps[0].body, '<p>Set the flag</p>');
    assert.strictEqual(steps[0].id, 7, 'keeps an id it was given');
  });

  test('normalizeRemediationSteps handles both shapes in one list', function (assert) {
    const steps = normalizeRemediationSteps([
      'Plain AI step',
      { heading: 'Edited', body: 'Body' },
    ]);

    assert.strictEqual(steps.length, 2);
    assert.strictEqual(steps[0].heading, '');
    assert.strictEqual(steps[0].body, 'Plain AI step');
    assert.strictEqual(steps[1].heading, 'Edited');
    assert.strictEqual(steps[1].body, 'Body');
  });

  test.each(
    'normalizeRemediationSteps returns an empty list for an absent value',
    [[undefined], [null], [[]]],
    function (assert, [value]) {
      assert.deepEqual(normalizeRemediationSteps(value), []);
    }
  );

  test('normalizeRemediationSteps defaults missing fields on an object step', function (assert) {
    const steps = normalizeRemediationSteps([{}]);

    assert.strictEqual(steps[0].heading, '');
    assert.strictEqual(steps[0].body, '');
  });

  test('normalizeVerificationSteps maps title and expected_result', function (assert) {
    const steps = normalizeVerificationSteps([
      {
        step_number: 1,
        title: 'Open the app',
        command: 'adb shell',
        expected_result: 'The activity launches',
        id: 4,
      },
    ]);

    assert.strictEqual(steps.length, 1);
    assert.strictEqual(steps[0].heading, 'Open the app');
    assert.strictEqual(steps[0].body, 'The activity launches');
    assert.strictEqual(steps[0].id, 4);
  });

  test.each(
    'normalizeVerificationSteps returns an empty list for an absent value',
    [[undefined], [null], [[]]],
    function (assert, [value]) {
      assert.deepEqual(normalizeVerificationSteps(value), []);
    }
  );

  test('buildStepId issues a new id on each call', function (assert) {
    const first = buildStepId();
    const second = buildStepId();

    assert.strictEqual(typeof first, 'number');
    assert.notStrictEqual(first, second);
  });

  // ─── Evidence ──────────────────────────────────────────────────────────────

  test('evidenceToHtml builds a list in the shape tiptap serializes', function (assert) {
    assert.strictEqual(
      evidenceToHtml(['First line', 'Second line']),
      '<ul><li><p>First line</p></li><li><p>Second line</p></li></ul>'
    );
  });

  test.each(
    'evidenceToHtml returns an empty string when there is nothing to show',
    [[undefined], [null], [[]], [['', '   ']]],
    function (assert, [value]) {
      assert.strictEqual(evidenceToHtml(value), '');
    }
  );

  test('evidenceFromHtml reads each list item, unwrapping the paragraph', function (assert) {
    assert.deepEqual(
      evidenceFromHtml(
        '<ul><li><p>First line</p></li><li><p>Second line</p></li></ul>'
      ),
      ['First line', 'Second line']
    );
  });

  test('evidenceFromHtml keeps inline markup inside an item', function (assert) {
    assert.deepEqual(
      evidenceFromHtml(
        '<ul><li><p>A <strong>bold</strong> claim</p></li></ul>'
      ),
      ['A <strong>bold</strong> claim']
    );
  });

  test('evidenceFromHtml reads prose with no list as a single entry', function (assert) {
    assert.deepEqual(evidenceFromHtml('<p>Just one note</p>'), [
      'Just one note',
    ]);
  });

  test.each(
    'evidenceFromHtml returns an empty list for empty input',
    [[''], ['   '], ['<p></p>'], ['<ul></ul>']],
    function (assert, [value]) {
      assert.deepEqual(evidenceFromHtml(value), []);
    }
  );

  test('evidence survives a round trip', function (assert) {
    const evidence = ['First line', 'Second line'];

    assert.deepEqual(evidenceFromHtml(evidenceToHtml(evidence)), evidence);
  });

  // ─── Response and payload ──────────────────────────────────────────────────

  test('toValidatedFindingContent flattens the nested response', function (assert) {
    const content = toValidatedFindingContent({
      validation: {
        confidence_label: 'HIGH',
        finding_summary: 'A summary',
        evidence: ['Evidence line'],
        reasoning: '<p>Because</p>',
      },
      remediation: { steps: ['Do the thing'] },
      poc: {
        verification_steps: [
          { step_number: 1, title: 'Step one', expected_result: 'It works' },
        ],
      },
      exploitability: {
        exploitability_likelihood: 'Medium',
        exploitability_analysis: { summary: 'Reachable remotely' },
      },
    });

    assert.strictEqual(content.confidence, 3);
    assert.strictEqual(content.summary, 'A summary');
    assert.deepEqual(content.evidence, ['Evidence line']);
    assert.strictEqual(content.reasoning, '<p>Because</p>');
    assert.strictEqual(content.remediationSteps[0].body, 'Do the thing');
    assert.strictEqual(content.stepsToReproduce[0].heading, 'Step one');
    assert.strictEqual(content.stepsToReproduce[0].body, 'It works');
    assert.strictEqual(content.exploitabilityLikelihood, 2);
    assert.strictEqual(content.exploitabilityAnalysis, 'Reachable remotely');
  });

  test('toValidatedFindingContent falls back for a finding with no AI content', function (assert) {
    const content = toValidatedFindingContent({});

    assert.strictEqual(content.confidence, UNKNOWN_SCALE_VALUE);
    assert.strictEqual(content.summary, '');
    assert.deepEqual(content.evidence, []);
    assert.strictEqual(content.reasoning, '');
    assert.deepEqual(content.remediationSteps, []);
    assert.deepEqual(content.stepsToReproduce, []);
    assert.strictEqual(content.exploitabilityLikelihood, UNKNOWN_SCALE_VALUE);
    assert.strictEqual(content.exploitabilityAnalysis, '');
  });

  test('toValidatedFindingPayload emits the flat write-only body', function (assert) {
    const payload = toValidatedFindingPayload({
      confidence: 2,
      summary: 'A summary',
      evidence: ['Evidence line'],
      reasoning: 'Because',
      remediationSteps: [{ heading: 'Fix', body: 'Do it', id: 1 }],
      stepsToReproduce: [{ heading: 'Open', body: 'It works', id: 2 }],
      exploitabilityLikelihood: 3,
      exploitabilityAnalysis: 'Reachable',
    });

    assert.deepEqual(payload, {
      confidence: 2,
      summary: 'A summary',
      evidence: ['Evidence line'],
      reasoning: 'Because',
      remediation_steps: [{ heading: 'Fix', body: 'Do it' }],
      steps_to_reproduce: [{ heading: 'Open', body: 'It works' }],
      exploitability_likelihood: 3,
      exploitability_analysis: 'Reachable',
    });
  });

  test('toValidatedFindingPayload never sends the client-only step id', function (assert) {
    const payload = toValidatedFindingPayload({
      confidence: UNKNOWN_SCALE_VALUE,
      summary: '',
      evidence: [],
      reasoning: '',
      remediationSteps: [{ heading: 'Fix', body: 'Do it', id: 99 }],
      stepsToReproduce: [{ heading: 'Open', body: 'It works', id: 100 }],
      exploitabilityLikelihood: UNKNOWN_SCALE_VALUE,
      exploitabilityAnalysis: '',
    });

    assert.notOk('id' in payload.remediation_steps[0]);
    assert.notOk('id' in payload.steps_to_reproduce[0]);
  });

  // ─── Validation builder ────────────────────────────────────────────────────

  test('buildValidation leaves untouched AI fields alone', function (assert) {
    const next = buildValidation(this.validation, {
      summary: 'Edited summary',
    });

    assert.strictEqual(next.finding_summary, 'Edited summary');
    assert.strictEqual(next.verdict, this.validation.verdict);
    assert.true(next.is_valid);

    assert.deepEqual(
      next.false_positive_indicators,
      this.validation.false_positive_indicators
    );

    assert.strictEqual(next.confidence_label, this.validation.confidence_label);
  });

  test.each(
    'buildValidation writes the confidence label for each value',
    [
      [3, 'HIGH'],
      [2, 'MEDIUM'],
      [1, 'LOW'],
      [UNKNOWN_SCALE_VALUE, 'UNKNOWN'],
      [99, 'UNKNOWN'],
    ],
    function (assert, [confidence, expected]) {
      assert.strictEqual(
        buildValidation(this.validation, { confidence }).confidence_label,
        expected
      );
    }
  );

  test('buildValidation stores evidence html as a string list', function (assert) {
    const next = buildValidation(this.validation, {
      evidenceHtml: '<ul><li><p>One</p></li><li><p>Two</p></li></ul>',
    });

    assert.deepEqual(next.evidence, ['One', 'Two']);
  });

  test('buildValidation applies several fields at once', function (assert) {
    const next = buildValidation(this.validation, {
      confidence: 1,
      summary: 'New summary',
      reasoning: 'New reasoning',
    });

    assert.strictEqual(next.confidence_label, 'LOW');
    assert.strictEqual(next.finding_summary, 'New summary');
    assert.strictEqual(next.reasoning, 'New reasoning');
  });

  test('buildValidation returns an unchanged copy for an empty edit', function (assert) {
    const next = buildValidation(this.validation, {});

    assert.deepEqual(next, this.validation);
    assert.notStrictEqual(
      next,
      this.validation,
      'does not mutate the original'
    );
  });

  // ─── Remediation builder ───────────────────────────────────────────────────

  test('buildRemediation replaces the steps and keeps the rest', function (assert) {
    const steps = [{ heading: 'Fix', body: 'Do it', id: 1 }];
    const next = buildRemediation(this.remediation, steps);

    assert.deepEqual(next.steps, steps);
    assert.strictEqual(next.remediation, this.remediation.remediation);
    assert.deepEqual(next.code_examples, this.remediation.code_examples);

    assert.notStrictEqual(
      next,
      this.remediation,
      'does not mutate the original'
    );
  });

  test('buildRemediation accepts an empty step list', function (assert) {
    assert.deepEqual(buildRemediation(this.remediation, []).steps, []);
  });

  // ─── Poc builder ───────────────────────────────────────────────────────────

  test('buildPoc maps editor steps onto verification steps', function (assert) {
    const next = buildPoc(this.poc, [
      { heading: 'Open the app', body: 'It launches', id: 5 },
      { heading: 'Tap export', body: 'A file is written', id: 6 },
    ]);

    assert.strictEqual(next.verification_steps.length, 2);

    assert.deepEqual(next.verification_steps[0], {
      step_number: 1,
      id: 5,
      title: 'Open the app',
      command: '',
      expected_result: 'It launches',
    });

    assert.deepEqual(next.verification_steps[1], {
      step_number: 2,
      id: 6,
      title: 'Tap export',
      command: '',
      expected_result: 'A file is written',
    });
  });

  test('buildPoc numbers steps from their position after a reorder', function (assert) {
    const next = buildPoc(this.poc, [
      { heading: 'Second', body: 'B', id: 2 },
      { heading: 'First', body: 'A', id: 1 },
    ]);

    assert.strictEqual(next.verification_steps[0].step_number, 1);
    assert.strictEqual(next.verification_steps[0].id, 2);
    assert.strictEqual(next.verification_steps[1].step_number, 2);
    assert.strictEqual(next.verification_steps[1].id, 1);
  });

  test('buildPoc keeps the rest of the blob', function (assert) {
    const next = buildPoc(this.poc, []);

    assert.strictEqual(next.poc_title, this.poc.poc_title);
    assert.deepEqual(next.expected_evidence, this.poc.expected_evidence);
    assert.deepEqual(next.verification_steps, []);
  });

  // ─── Exploitability builder ────────────────────────────────────────────────

  test.each(
    'buildExploitability writes the likelihood label for each value',
    [
      [3, 'High'],
      [2, 'Medium'],
      [1, 'Low'],
      [UNKNOWN_SCALE_VALUE, 'Unknown'],
      [99, 'Unknown'],
    ],
    function (assert, [likelihood, expected]) {
      assert.strictEqual(
        buildExploitability(this.exploitability, { likelihood })
          .exploitability_likelihood,
        expected
      );
    }
  );

  test('buildExploitability writes the analysis summary, keeping its evidence', function (assert) {
    const next = buildExploitability(this.exploitability, {
      analysis: 'Reachable over the network',
    });

    assert.strictEqual(
      next.exploitability_analysis.summary,
      'Reachable over the network'
    );

    assert.deepEqual(
      next.exploitability_analysis.evidence,
      this.exploitability.exploitability_analysis.evidence
    );
  });

  test('buildExploitability leaves untouched AI fields alone', function (assert) {
    const next = buildExploitability(this.exploitability, { likelihood: 1 });

    assert.strictEqual(next.score, this.exploitability.score);
    assert.deepEqual(next.signals, this.exploitability.signals);
    assert.deepEqual(next.attack_scenario, this.exploitability.attack_scenario);
    assert.strictEqual(next.ai_model_used, this.exploitability.ai_model_used);
  });

  test('buildExploitability returns an unchanged copy for an empty edit', function (assert) {
    const next = buildExploitability(this.exploitability, {});

    assert.deepEqual(next, this.exploitability);

    assert.notStrictEqual(
      next,
      this.exploitability,
      'does not mutate the original'
    );
  });
});
