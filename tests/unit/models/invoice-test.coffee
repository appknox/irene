`import { moduleForModel, test } from 'ember-qunit'`

moduleForModel 'invoice', 'Unit | Model | invoice', {
  # Specify the other units that are required for this test.
  needs: ['model:user','model:pricing','model:invoice']
}

test 'it exists', (assert) ->
  model = @subject()
  # store = @store()
  assert.ok !!model
