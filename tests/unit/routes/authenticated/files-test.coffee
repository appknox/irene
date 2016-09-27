`import { moduleFor, test } from 'ember-qunit'`

moduleFor 'route:authenticated/files', 'Unit | Route | authenticated/files', {
  # Specify the other units that are required for this test.
  # needs: ['controller:foo']
}

test 'it exists', (assert) ->
  route = @subject()
  assert.ok route
