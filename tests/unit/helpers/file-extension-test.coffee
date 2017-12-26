`import { fileExtension } from 'irene/helpers/file-extension'`
`import { module, test } from 'qunit'`

module 'Unit | Helper | file extension'

test 'it should return extension for corrent file name', (assert) ->
  extn = fileExtension ['test.txt']
  assert.equal(extn, 'txt')

test 'it should return \'unk\' extension for file name without extension', (assert) ->
  extn = fileExtension ['Untitled']
  assert.equal(extn, 'unk')

test 'it should return null for empty array input', (assert) ->
  extn = fileExtension []
  assert.equal(extn, null)
