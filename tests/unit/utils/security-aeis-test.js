import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import {
  SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS,
  buildFullSignals,
  isAeisLikelihood,
} from 'irene/utils/security-aeis';

module('Unit | Utility | security-aeis', function (hooks) {
  setupTest(hooks);

  // ─── Signal keys ───────────────────────────────────────────────────────────

  test('it declares the seven vectors the override endpoint validates', function (assert) {
    assert.deepEqual(
      [...SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS],
      [
        'requires_chaining',
        'remote_exploitation',
        'public_exploit_exists',
        'local_exploitation_only',
        'minimal_user_interaction',
        'no_authentication_required',
        'obscure_or_environment_specific',
      ]
    );
  });

  test('buildFullSignals keeps the vectors it is given', function (assert) {
    const signals = buildFullSignals({
      requires_chaining: true,
      remote_exploitation: false,
    });

    assert.true(signals.requires_chaining);
    assert.false(signals.remote_exploitation);
  });

  test('buildFullSignals fills every missing vector with unknown', function (assert) {
    assert.expect(SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.length);

    const signals = buildFullSignals({ requires_chaining: true });

    assert.strictEqual(
      Object.keys(signals).length,
      SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.length
    );

    SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.filter(
      (key) => key !== 'requires_chaining'
    ).forEach((key) => {
      assert.strictEqual(signals[key], 'unknown', `${key} defaults to unknown`);
    });
  });

  test.each(
    'buildFullSignals returns all seven vectors as unknown for an absent value',
    [[undefined], [null], [{}]],
    function (assert, [value]) {
      const signals = buildFullSignals(value);

      assert.deepEqual(
        Object.keys(signals).sort((a, b) => a.localeCompare(b)),
        [...SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS].sort((a, b) =>
          a.localeCompare(b)
        )
      );

      assert.true(
        Object.values(signals).every((signal) => signal === 'unknown')
      );
    }
  );

  test('buildFullSignals drops a vector the endpoint does not accept', function (assert) {
    const signals = buildFullSignals({ not_a_real_vector: true });

    assert.notOk('not_a_real_vector' in signals);
  });

  // ─── Likelihood ────────────────────────────────────────────────────────────

  test.each(
    'isAeisLikelihood accepts only the four values the endpoint takes',
    [
      ['low', true],
      ['medium', true],
      ['high', true],
      ['critical', true],
      ['unknown', false],
      ['High', false],
      ['', false],
    ],
    function (assert, [value, expected]) {
      assert.strictEqual(isAeisLikelihood(value), expected);
    }
  );
});
