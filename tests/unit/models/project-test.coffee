`import { moduleForModel, test } from 'ember-qunit'`

moduleForModel 'project', 'Unit | Model | project', {
  # Specify the other units that are required for this test.
  needs: ["model:user", "model:file", "model:collaboration"]
}

test 'it exists', (assert) ->
  model = @subject()
  # store = @store()
  assert.ok !!model
