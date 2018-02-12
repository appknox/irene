`import { appEnvironment } from 'irene/helpers/app-environment'`
`import { module, test } from 'qunit'`

module 'Unit | Helper | app environment'

# Replace this with your real tests.
test 'it works', (assert) ->
  result = appEnvironment 42
  assert.ok result
