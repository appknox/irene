`import crypt from '../../../utils/crypt'`
`import { module, test } from 'qunit'`

module 'crypt'

# Replace this with your real tests.
test 'it works', (assert) ->
  result = crypt.decrypt("eyJ1c2VybmFtZSI6ImRoaWxpcHNpdmEiLCJleHAiOjE0NTA3ODUzODEsInVzZXJfaWQiOjEsImVtYWlsIjoiZGhpbGlwc2l2YUBnbWFpbC5jb20ifQ")
  assert.equal result.username, 'dhilipsiva'
  assert.equal result.exp , 1450785381
  assert.equal result.user_id , 1
  assert.equal result.email , 'dhilipsiva@gmail.com'
