import { fileExtension } from 'irene/helpers/file-extension';
import { module, test } from 'qunit';

module('Unit | Helper | file extension', function() {
  test('it should return extension for corrent file name', function(assert) {
    const extn = fileExtension(['test.txt']);
    return assert.equal(extn, 'txt');
  });

  test('it should return \'unk\' extension for file name without extension', function(assert) {
    const extn = fileExtension(['Untitled']);
    return assert.equal(extn, 'unk');
  });

  test('it should return null for empty array input', function(assert) {
    const extn = fileExtension([]);
    return assert.equal(extn, null);
  });
});
