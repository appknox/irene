`import { moduleForModel, test } from 'ember-qunit'`

moduleForModel 'user', 'Unit | Model | user', {
  # Specify the other units that are required for this test.
  needs: ['model:project', 'model:submission', 'model:collaboration']
}

test 'it exists', (assert) ->
  model = @subject()
  # store = @store()
  assert.ok !!model
