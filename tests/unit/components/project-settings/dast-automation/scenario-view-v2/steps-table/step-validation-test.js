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

  // ─── ENTER_OTP ───────────────────────────────────────────────────────────

  test.each(
    'ENTER_OTP (from an app): requires a well-formed, allowed app id',
    [
      ['com.apple.MobileSMS', null],
      ['com.google.android.apps.messaging', null],
      ['com.example.mail_app-2', null],
      ['', 'dastAutomation.validation.valueRequired'],
      ['messages', 'dastAutomation.validation.otpAppIdInvalid'],
      ['com.example.', 'dastAutomation.validation.otpAppIdInvalid'],
      ['com.exa mple', 'dastAutomation.validation.otpAppIdInvalid'],
      [`com.${'a'.repeat(252)}`, 'dastAutomation.validation.otpAppIdInvalid'],
      ['com.apple.Preferences', 'dastAutomation.validation.otpAppBlocked'],
      ['com.android.settings', 'dastAutomation.validation.otpAppBlocked'],
      ['com.appknox.agent', 'dastAutomation.validation.otpAppBlocked'],
    ],
    function (assert, [value, expectedError]) {
      const result = validateStep(
        makeStep({
          action: ScenarioStepAction.ENTER_OTP,
          identifier: 'Verification code',
          value,
          metadata: { source: 'app' },
        })
      );

      assert.strictEqual(result?.value ?? null, expectedError);
    }
  );

  test.each(
    'ENTER_OTP (from an app): optional instructions (metadata.note) up to 256 chars',
    [
      [undefined, null],
      ['Open the AuthLab entry', null],
      ['n'.repeat(256), null],
      ['n'.repeat(257), 'dastAutomation.validation.otpNoteTooLong'],
    ],
    function (assert, [note, expectedError]) {
      const metadata =
        note === undefined ? { source: 'app' } : { source: 'app', note };

      const result = validateStep(
        makeStep({
          action: ScenarioStepAction.ENTER_OTP,
          identifier: 'Verification code',
          value: 'com.apple.MobileSMS',
          metadata,
        })
      );

      assert.strictEqual(result?.value ?? null, expectedError);
    }
  );

  test('ENTER_OTP: missing source is treated as from an app', function (assert) {
    const result = validateStep(
      makeStep({
        action: ScenarioStepAction.ENTER_OTP,
        identifier: 'Verification code',
        value: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
        metadata: {},
      })
    );

    assert.strictEqual(
      result?.value,
      'dastAutomation.validation.otpAppIdInvalid'
    );
  });

  test.each(
    'ENTER_OTP (authenticator key): requires a base32 key or otpauth://totp link',
    [
      ['', 'dastAutomation.validation.valueRequired'],
      ['GEZD GNBV GY3T QOJQ GEZD GNBV GY3T QOJQ', null],
      ['gezdgnbvgy3tqojqgezdgnbvgy3tqojq', null],
      ['otpauth://totp/App:qa?secret=GEZDGNBVGY3TQOJQ&digits=6', null],
      [
        'otpauth://hotp/App:qa?secret=GEZDGNBVGY3TQOJQ',
        'dastAutomation.validation.authenticatorKeyInvalid',
      ],
      ['not base32 !!', 'dastAutomation.validation.authenticatorKeyInvalid'],
      ['JBSW', 'dastAutomation.validation.authenticatorKeyInvalid'],
      [
        'com.apple.MobileSMS',
        'dastAutomation.validation.authenticatorKeyInvalid',
      ],
    ],
    function (assert, [value, expectedError]) {
      const result = validateStep(
        makeStep({
          action: ScenarioStepAction.ENTER_OTP,
          identifier: 'Verification code',
          value,
          isSecure: true,
          metadata: { source: 'authenticator_key' },
        })
      );

      assert.strictEqual(result?.value ?? null, expectedError);
    }
  );

  test('ENTER_OTP (authenticator key): secure mask passes', function (assert) {
    const step = makeStep({
      action: ScenarioStepAction.ENTER_OTP,
      identifier: 'Verification code',
      value: '************',
      isSecure: true,
      metadata: { source: 'authenticator_key' },
    });

    assert.strictEqual(validateStep(step), null);
  });

  test.each(
    'ENTER_OTP: the identifier is set automatically, so it is never reported',
    [
      [{ source: 'app' }, 'com.apple.MobileSMS'],
      [{ source: 'authenticator_key' }, 'GEZDGNBVGY3TQOJQ'],
    ],
    function (assert, [metadata, value]) {
      const result = validateStep(
        makeStep({
          action: ScenarioStepAction.ENTER_OTP,
          identifier: '',
          value,
          metadata,
        })
      );

      assert.strictEqual(result, null);
    }
  );

  // ─── LONG_PRESS ──────────────────────────────────────────────────────────

  test.each(
    'LONG_PRESS: empty passes (whenPresent); 1-300000 valid; outside range errors',
    [
      ['', null],
      ['1', null],
      ['300000', null],
      ['0', 'dastAutomation.validation.longPressValueRange'],
      ['-1', 'dastAutomation.validation.longPressValueRange'],
      ['300001', 'dastAutomation.validation.longPressValueRange'],
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
