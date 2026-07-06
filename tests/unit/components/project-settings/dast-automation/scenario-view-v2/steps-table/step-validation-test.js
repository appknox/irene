import { module, test } from 'qunit';
import { ScenarioStepAction } from 'irene/models/scenario-step';
import { validateStep } from 'irene/components/project-settings/dast-automation/scenario-view-v2/steps-table/step-validation';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns a minimal step-like object satisfying validateStep's interface.
 * Defaults to a valid TAP step; override any field via overrides.
 */
function makeStep(overrides = {}) {
  return {
    identifier: 'btn-login',
    value: '1',
    action: ScenarioStepAction.TAP,
    isSecure: false,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

module('Unit | Utility | step-validation', function () {
  // ─── Valid step ───────────────────────────────────────────────────────────

  test('returns null for a fully valid step', function (assert) {
    assert.strictEqual(validateStep(makeStep()), null);
  });

  // ─── Identifier ──────────────────────────────────────────────────────────

  test.each(
    'returns an identifier error for empty, whitespace-only, and over-length inputs',
    [
      ['', 'dastAutomation.validation.identifierRequired'],
      ['   ', 'dastAutomation.validation.identifierRequired'],
      ['a'.repeat(65), 'dastAutomation.validation.identifierTooLong'],
    ],
    function (assert, [identifier, expectedError]) {
      const result = validateStep(makeStep({ identifier }));

      assert.strictEqual(result?.identifier, expectedError);
    }
  );

  test('identifier at exactly 64 chars is valid', function (assert) {
    assert.strictEqual(
      validateStep(makeStep({ identifier: 'a'.repeat(64) })),
      null
    );
  });

  // ─── TAP ─────────────────────────────────────────────────────────────────

  test.each(
    'TAP: empty passes (whenPresent); 1-20 are valid; outside range and non-integers error',
    [
      ['', null],
      ['1', null],
      ['20', null],
      ['0', 'dastAutomation.validation.tapValueRange'],
      ['21', 'dastAutomation.validation.tapValueRange'],
      ['1.5', 'dastAutomation.validation.tapValueRange'],
      ['abc', 'dastAutomation.validation.tapValueRange'],
    ],
    function (assert, [value, expectedError]) {
      const result = validateStep(
        makeStep({ action: ScenarioStepAction.TAP, value })
      );

      assert.strictEqual(result?.value ?? null, expectedError);
    }
  );

  // ─── WAIT ────────────────────────────────────────────────────────────────

  test.each(
    'WAIT: required and 1–60 valid; empty and out-of-range error',
    [
      ['', 'dastAutomation.validation.valueRequired'],
      ['1', null],
      ['60', null],
      ['0', 'dastAutomation.validation.waitValueRange'],
      ['61', 'dastAutomation.validation.waitValueRange'],
      ['abc', 'dastAutomation.validation.waitValueRange'],
    ],
    function (assert, [value, expectedError]) {
      const result = validateStep(
        makeStep({ action: ScenarioStepAction.WAIT, value })
      );

      assert.strictEqual(result?.value ?? null, expectedError);
    }
  );

  // ─── LONG_PRESS ──────────────────────────────────────────────────────────

  test.each(
    'LONG_PRESS: empty passes (whenPresent); positive integers valid; non-positive error',
    [
      ['', null],
      ['1', null],
      ['0', 'dastAutomation.validation.longPressValueRange'],
      ['-1', 'dastAutomation.validation.longPressValueRange'],
      ['abc', 'dastAutomation.validation.longPressValueRange'],
    ],
    function (assert, [value, expectedError]) {
      const result = validateStep(
        makeStep({ action: ScenarioStepAction.LONG_PRESS, value })
      );

      assert.strictEqual(result?.value ?? null, expectedError);
    }
  );

  // ─── ENTER_TEXT ──────────────────────────────────────────────────────────

  test.each(
    'ENTER_TEXT: required and max 512 chars; over-length errors',
    [
      ['', 'dastAutomation.validation.valueRequired'],
      ['hello', null],
      ['a'.repeat(512), null],
      ['a'.repeat(513), 'dastAutomation.validation.enterTextTooLong'],
    ],
    function (assert, [value, expectedError]) {
      const result = validateStep(
        makeStep({ action: ScenarioStepAction.ENTER_TEXT, value })
      );

      assert.strictEqual(result?.value ?? null, expectedError);
    }
  );

  test('ENTER_TEXT: secure mask bypasses the length check', function (assert) {
    // isSecure + the display mask value must not be rejected as invalid
    const result = validateStep(
      makeStep({
        action: ScenarioStepAction.ENTER_TEXT,
        value: '************',
        isSecure: true,
      })
    );

    assert.strictEqual(result?.value, undefined);
  });

  // ─── SELECT ──────────────────────────────────────────────────────────────

  test.each(
    'SELECT: required and max 32 chars; over-length errors',
    [
      ['', 'dastAutomation.validation.valueRequired'],
      ['option', null],
      ['x'.repeat(32), null],
      ['x'.repeat(33), 'dastAutomation.validation.selectTooLong'],
    ],
    function (assert, [value, expectedError]) {
      const result = validateStep(
        makeStep({ action: ScenarioStepAction.SELECT, value })
      );

      assert.strictEqual(result?.value ?? null, expectedError);
    }
  );

  // ─── CHECK ───────────────────────────────────────────────────────────────

  test.each(
    'CHECK: empty passes (whenPresent); true/false valid case-insensitively; other values error',
    [
      ['', null],
      ['true', null],
      ['false', null],
      ['TRUE', null],
      ['yes', 'dastAutomation.validation.checkValueInvalid'],
      ['1', 'dastAutomation.validation.checkValueInvalid'],
    ],
    function (assert, [value, expectedError]) {
      const result = validateStep(
        makeStep({ action: ScenarioStepAction.CHECK, value })
      );

      assert.strictEqual(result?.value ?? null, expectedError);
    }
  );

  // ─── SWIPE ───────────────────────────────────────────────────────────────

  test.each(
    'SWIPE: required; up/down/left/right valid case-insensitively; other directions error',
    [
      ['', 'dastAutomation.validation.valueRequired'],
      ['up', null],
      ['down', null],
      ['left', null],
      ['right', null],
      ['UP', null],
      ['diagonal', 'dastAutomation.validation.swipeValueInvalid'],
      ['forward', 'dastAutomation.validation.swipeValueInvalid'],
    ],
    function (assert, [value, expectedError]) {
      const result = validateStep(
        makeStep({ action: ScenarioStepAction.SWIPE, value })
      );

      assert.strictEqual(result?.value ?? null, expectedError);
    }
  );

  // ─── Combined errors ──────────────────────────────────────────────────────

  test('returns both identifier and value errors when both are invalid', function (assert) {
    const result = validateStep(
      makeStep({
        action: ScenarioStepAction.ENTER_TEXT,
        identifier: '',
        value: '',
      })
    );

    assert.strictEqual(
      result?.identifier,
      'dastAutomation.validation.identifierRequired'
    );

    assert.strictEqual(
      result?.value,
      'dastAutomation.validation.valueRequired'
    );
  });

  // ─── Action with no value validator ──────────────────────────────────────

  test('DRAG (no value validator) ignores value and only validates identifier', function (assert) {
    // Valid identifier + empty value → no error at all
    assert.strictEqual(
      validateStep(makeStep({ action: ScenarioStepAction.DRAG, value: '' })),
      null
    );

    // Empty identifier → only an identifier error; no value error
    const result = validateStep(
      makeStep({ action: ScenarioStepAction.DRAG, identifier: '', value: '' })
    );

    assert.strictEqual(
      result?.identifier,
      'dastAutomation.validation.identifierRequired'
    );

    assert.strictEqual(result?.value, undefined);
  });
});
