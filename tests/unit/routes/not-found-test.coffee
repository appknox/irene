`import { moduleFor, test } from 'ember-qunit'`

moduleFor 'route:not-found', 'Unit | Route | not found', {
  # Specify the other units that are required for this test.
  # needs: ['controller:foo']
}

test 'it exists', (assert) ->
  route = @subject()
  assert.ok route
