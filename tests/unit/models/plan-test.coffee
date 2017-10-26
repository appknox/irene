`import { moduleForModel, test } from 'ember-qunit'`

moduleForModel 'plan', 'Unit | Model | plan', {
  # Specify the other units that are required for this test.
  needs: ['model:invoice']
}

test 'it exists', (assert) ->
  model = @subject()
  # store = @store()
  assert.ok !!model
