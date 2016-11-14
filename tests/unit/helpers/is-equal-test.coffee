`import { isEqualTo } from 'irene/helpers/is-equal'`
`import { module, test } from 'qunit'`

module 'Unit | Helper | is equal'

# Replace this with your real tests.
test 'it works', (assert) ->
  result = isEqualTo [42,42]
  assert.ok result
