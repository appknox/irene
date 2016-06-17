`import { test, moduleForModel } from 'ember-qunit'`

moduleForModel 'submission', {
  # Specify the other units that are required for this test.
  needs: []
}

test 'it exists', (assert) ->
  model = @subject()
  # store = @store()
  assert.ok !!model
