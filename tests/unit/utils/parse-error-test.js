import { module, test } from 'qunit';
import parseError from 'irene/utils/parse-error';

module('Unit | Utility | parse-error', function () {
  module('DRF field errors', function () {
    test('reads the message out of a field-keyed error body', function (assert) {
      // What a serializer validation failure looks like: keyed by field, no
      // `detail`. Before this was handled the caller showed its generic
      // fallback and the reason was lost.
      assert.strictEqual(
        parseError(
          { payload: { p12: ['file too large (max 256 KB)'] } },
          'please try again'
        ),
        'file too large (max 256 KB)'
      );
    });

    test('reads it from the error itself when there is no payload', function (assert) {
      assert.strictEqual(
        parseError(
          { mobileprovision: ['provisioning profile has already expired'] },
          'please try again'
        ),
        'provisioning profile has already expired'
      );
    });

    test('falls back when no value is a list of strings', function (assert) {
      assert.strictEqual(
        parseError({ payload: { count: 3 } }, 'please try again'),
        'please try again',
        'a stray non-error field is not mistaken for the message'
      );
    });
  });

  module('existing shapes are unchanged', function () {
    test('detail still wins over a field error', function (assert) {
      assert.strictEqual(
        parseError(
          { payload: { detail: 'CYOD is not enabled', p12: ['ignored'] } },
          'please try again'
        ),
        'CYOD is not enabled'
      );
    });

    test('message, title and the 500/0 statuses are untouched', function (assert) {
      assert.strictEqual(
        parseError({ payload: { message: 'boom' } }, 'fallback'),
        'boom'
      );

      assert.strictEqual(parseError({ detail: 'nope' }, 'fallback'), 'nope');
      assert.strictEqual(parseError({ message: 'bang' }, 'fallback'), 'bang');

      assert.strictEqual(
        parseError({ status: 500, title: 'Server Error' }, 'fallback'),
        'Server Error'
      );

      assert.strictEqual(
        parseError({ status: 0 }, 'fallback'),
        'API request failed'
      );
    });

    test('the first of an errors array is still used', function (assert) {
      assert.strictEqual(
        parseError({ errors: [{ detail: 'first' }, { detail: 'second' }] }),
        'first'
      );
    });

    test('an unrecognised error returns the default', function (assert) {
      assert.strictEqual(parseError({}, 'please try again'), 'please try again');
    });
  });
});
