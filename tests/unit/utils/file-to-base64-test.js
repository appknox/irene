import { module, test } from 'qunit';

import { fileToBase64 } from 'irene/utils/file-to-base64';

module('Unit | Utility | file-to-base64', function () {
  test('it encodes a file as base64', async function (assert) {
    const encoded = await fileToBase64(new File(['p12-bytes'], 'identity.p12'));

    assert.strictEqual(encoded, btoa('p12-bytes'));
  });

  test('it encodes bytes that are not valid utf-8 text', async function (assert) {
    // A DER-encoded .p12 is binary. `b64EncodeUnicode` runs its input through
    // `encodeURIComponent` and mangles bytes like these, which is why this
    // helper reads the raw bytes instead.
    const bytes = new Uint8Array([0x30, 0x82, 0x0a, 0xff, 0x00, 0xfe]);
    const encoded = await fileToBase64(new File([bytes], 'identity.p12'));

    assert.strictEqual(
      encoded,
      btoa(String.fromCodePoint(...bytes)),
      'every byte survives the round trip'
    );
  });

  test('it encodes a file larger than one chunk', async function (assert) {
    // The helper feeds bytes to `String.fromCharCode` in 0x8000 slices so a
    // large file does not overflow the call stack, so cross that boundary.
    const bytes = new Uint8Array(0x8000 * 2 + 17).map((_, i) => i % 256);
    const encoded = await fileToBase64(new File([bytes], 'big.p12'));

    const decoded = Uint8Array.from(atob(encoded), (c) => c.codePointAt(0));

    assert.strictEqual(decoded.length, bytes.length);
    assert.deepEqual(Array.from(decoded), Array.from(bytes));
  });
});
