import { module, test } from 'qunit';

import { splitInlineCodeSegments } from 'irene/helpers/inline-code-segments';

module('Unit | Helper | inline-code-segments', function () {
  test('returns empty array for empty text', function (assert) {
    assert.deepEqual(splitInlineCodeSegments(''), []);
  });

  test('returns one plain segment when there is no backtick span', function (assert) {
    assert.deepEqual(splitInlineCodeSegments('plain evidence text'), [
      { text: 'plain evidence text', isCode: false },
    ]);
  });

  test('splits a single backtick span out of surrounding prose', function (assert) {
    const result = splitInlineCodeSegments(
      'Sent `GET /run?target=127.0.0.1; id` which executed the command.'
    );

    assert.deepEqual(result, [
      { text: 'Sent ', isCode: false },
      { text: 'GET /run?target=127.0.0.1; id', isCode: true },
      { text: ' which executed the command.', isCode: false },
    ]);
  });

  test('handles multiple backtick spans in one string', function (assert) {
    const result = splitInlineCodeSegments(
      'Control `ping -c 1` vs probe `ping -c 1; id` diverged.'
    );

    assert.deepEqual(result, [
      { text: 'Control ', isCode: false },
      { text: 'ping -c 1', isCode: true },
      { text: ' vs probe ', isCode: false },
      { text: 'ping -c 1; id', isCode: true },
      { text: ' diverged.', isCode: false },
    ]);
  });

  test('a string that is entirely one backtick span yields only a code segment', function (assert) {
    assert.deepEqual(splitInlineCodeSegments('`uid=10001(fixture)`'), [
      { text: 'uid=10001(fixture)', isCode: true },
    ]);
  });
});
