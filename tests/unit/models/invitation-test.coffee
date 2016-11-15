`import { moduleForModel, test } from 'ember-qunit'`

moduleForModel 'invitation', 'Unit | Model | invitation', {
  # Specify the other units that are required for this test.
  needs: ['model:user','model:project']
}

test 'it exists', (assert) ->
  model = @subject()
  # store = @store()
  assert.ok !!model
