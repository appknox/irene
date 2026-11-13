import { module, test } from 'qunit';

import {
  goalTechniqueMetrics,
  resolveGoalView,
  techniqueTone,
} from 'irene/utils/offsec-goal-verdict';

const PLAN = {
  number: 1,
  status: 'succeeded',
  hypothesis: 'Hooking native strncmp bypasses the check.',
  steps: ['frida_attach', 'hook_native'],
  reasoning: 'libfoo.so compares strings.',
  expected: 'App runs without exit.',
  reason: 'Hook succeeded.',
  observations: [7],
};

const SPENT_PLAN = {
  number: 2,
  status: 'spent',
  hypothesis: 'Launching shows a UI.',
  steps: ['app_launch'],
  reasoning: 'MainActivity is exported.',
  expected: 'Interactive elements.',
  reason: 'The hypothesis did not hold.',
};

const ABANDONED_PLAN = { ...SPENT_PLAN, number: 3, status: 'abandoned' };

const FINDING = {
  pattern: 'credential_assignment',
  kind: 'credential',
  where: 'inspect_strings',
  quote: '; password:',
  severity_because: ['it ships in the APK', 'no root needed'],
  exploitability: 'unproven',
  exploitability_because: 'no check has run',
};

function goal(overrides = {}) {
  return {
    goal_id: 'find-data',
    goal_name: 'Find data',
    status: 'completed',
    reason: 'root check defeated',
    plans: [],
    findings: [],
    observations: [],
    ...overrides,
  };
}

module('Unit | Utility | offsec-goal-verdict', function () {
  test('the API verdict and the login goal are left alone', function (assert) {
    const withVerdict = goal({ verdict: 'held' });

    assert.strictEqual(resolveGoalView(withVerdict), withVerdict);

    const login = goal({ goal_id: 'login' });

    assert.strictEqual(resolveGoalView(login), login);
  });

  test('a succeeded plan becomes an exploited technique with a path to it', function (assert) {
    const resolved = resolveGoalView(
      goal({
        plans: [PLAN],
        observations: [{ id: 7, verb: 'frida_attach', note: 'attached' }],
      })
    );

    assert.strictEqual(resolved.verdict, 'exploited');
    assert.strictEqual(resolved.paths.length, 1);
    assert.strictEqual(resolved.paths[0].type, 'chain');
    assert.strictEqual(resolved.paths[0].steps[0].label, 'plan-1');
    assert.strictEqual(resolved.paths[0].outcome, 'App runs without exit.');

    const [technique] = resolved.techniques;

    assert.strictEqual(technique.id, 'plan-1');
    assert.strictEqual(technique.status, 'exploited');
    assert.strictEqual(technique.category, 'Frida attach');
    assert.deepEqual(technique.repro, ['Frida attach', 'Hook native']);
    assert.strictEqual(technique.evidence, 'frida_attach: attached');
  });

  test('the same plan on an unfinished goal is only partly exploited', function (assert) {
    const resolved = resolveGoalView(
      goal({ status: 'budget_exhausted', plans: [PLAN] })
    );

    assert.strictEqual(resolved.verdict, 'partial');
  });

  test('findings with no proven exploit read as a weakness', function (assert) {
    const resolved = resolveGoalView(goal({ findings: [FINDING] }));

    assert.strictEqual(resolved.verdict, 'weakness');

    const [technique] = resolved.techniques;

    assert.strictEqual(technique.status, 'confirmed');
    assert.strictEqual(technique.category, 'Credential');
    assert.strictEqual(technique.name, 'Credential assignment');
    assert.strictEqual(technique.flaw, 'it ships in the APK');
    assert.strictEqual(technique.tried, 'no root needed');
    assert.strictEqual(technique.location, 'inspect_strings');
    assert.strictEqual(technique.evidence, '; password:');
  });

  test('demonstrated findings are exploited, grouped into one path per file, with each secret quoted alongside its reasons', function (assert) {
    const demonstrated = {
      ...FINDING,
      exploitability: 'demonstrated',
      exploitability_because: 'the running app was made to hand it over',
      verb: 'read_file',
      where: 'read_file files/data.json',
      value: 'SuperSecretValue1234',
      redacted: 'Supe************1234',
      quote: '"key": "SuperSecretValue1234"',
    };

    const resolved = resolveGoalView(
      goal({
        status: 'budget_exhausted',
        findings: [
          demonstrated,
          { ...demonstrated, pattern: 'other' },
          { ...demonstrated, where: 'read_file shared_prefs/p.xml' },
        ],
      })
    );

    assert.strictEqual(resolved.verdict, 'partial');
    assert.strictEqual(resolved.paths.length, 2, 'one path per file');
    assert.strictEqual(resolved.paths[0].steps.length, 2);
    assert.strictEqual(
      resolved.paths[0].outcome,
      '2 secrets recovered from files/data.json'
    );
    assert.strictEqual(
      resolved.paths[1].outcome,
      'Secret recovered from shared_prefs/p.xml'
    );

    const [technique] = resolved.techniques;

    assert.strictEqual(technique.status, 'exploited');
    assert.strictEqual(
      resolved.paths[0].steps[0].text,
      'Credential assignment — "key": "SuperSecretValue1234"'
    );
    assert.strictEqual(technique.evidence, '"key": "SuperSecretValue1234"');
    assert.deepEqual(technique.credentials, [
      {
        quote: '"key": "SuperSecretValue1234"',
        exploitability_because: 'The running app was made to hand it over.',
        severity_because: ['It ships in the APK.', 'No root needed.'],
      },
    ]);
    assert.strictEqual(
      technique.description,
      'It ships in the APK. The running app was made to hand it over.'
    );
    assert.deepEqual(technique.repro, [
      'Ran read_file against files/data.json.',
      'The running app was made to hand it over.',
    ]);
  });

  test('techniques the API sent get the credentials of the findings their evidence shows', function (assert) {
    const finding = {
      ...FINDING,
      redacted: '0758****d8db',
      quote: '> Authorization: 0758abcdd8db',
      exploitability_because: 'it was sent over the network',
    };

    const resolved = resolveGoalView(
      goal({
        verdict: 'exploited',
        findings: [finding, { ...finding, redacted: '********' }],
        techniques: [
          {
            id: 't-1',
            category: 'credential-runtime',
            name: 'high entropy assignment',
            flaw: 'a credential exposed at runtime',
            status: 'exploited',
            evidence: '0758****d8db — network_sent com.example',
          },
        ],
      })
    );

    assert.deepEqual(resolved.techniques[0].credentials, [
      {
        quote: '> Authorization: 0758abcdd8db',
        exploitability_because: 'It was sent over the network.',
        severity_because: ['It ships in the APK.', 'No root needed.'],
      },
    ]);
  });

  test('a credential shows its quote when the value is in it, and the value when it is not', function (assert) {
    const inQuote = {
      ...FINDING,
      value: '1dbc1c23',
      quote: '> Authorization: 1dbc1c23',
    };

    const garbled = {
      ...FINDING,
      value: 'eyJhbGciOiJFUzI1NiJ9.e30.sig',
      quote: 'X$versionY$archiverT$top authToken fheVjfxB …',
    };

    const { techniques } = resolveGoalView(
      goal({ findings: [inQuote, garbled] })
    );

    assert.strictEqual(
      techniques[0].credentials[0].quote,
      '> Authorization: 1dbc1c23'
    );
    assert.strictEqual(
      techniques[1].credentials[0].quote,
      'eyJhbGciOiJFUzI1NiJ9.e30.sig'
    );
  });

  test('with nothing found, a finished goal is held and an unfinished one untested', function (assert) {
    assert.strictEqual(
      resolveGoalView(goal({ plans: [SPENT_PLAN] })).verdict,
      'held'
    );

    assert.strictEqual(
      resolveGoalView(goal({ status: 'budget_exhausted' })).verdict,
      'untested'
    );
  });

  test('plans that did not succeed become safe or untested techniques', function (assert) {
    const { techniques } = resolveGoalView(
      goal({ plans: [SPENT_PLAN, ABANDONED_PLAN] })
    );

    assert.deepEqual(
      techniques.map((t) => t.status),
      ['safe', 'not_tested']
    );
    assert.strictEqual(
      techniques[0].safe_result,
      'The hypothesis did not hold.'
    );
  });

  test('technique metrics and tones', function (assert) {
    const metrics = goalTechniqueMetrics([
      { status: 'exploited' },
      { status: 'confirmed' },
      { status: 'safe' },
      { status: 'not_tested' },
    ]);

    assert.deepEqual(metrics, {
      exploited: 1,
      tested: 3,
      testedUnexploited: 2,
      safe: 1,
      notTested: 1,
      total: 4,
    });

    assert.strictEqual(
      techniqueTone('confirmed'),
      'partial',
      'a confirmed weakness is amber on a technique'
    );
  });
});
