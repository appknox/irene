`import { moduleForModel, test } from 'ember-qunit'`

moduleForModel 'team', 'Unit | Model | team', {
  # Specify the other units that are required for this test.
  needs: ["model:team", "model:user", "model:collaboration"]
}

test 'it exists', (assert) ->
  model = @subject()
  # store = @store()
  assert.ok !!model
