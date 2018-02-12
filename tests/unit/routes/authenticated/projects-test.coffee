`import { moduleFor, test } from 'ember-qunit'`

moduleFor 'route:authenticated/projects', 'Unit | Route | authenticated/projects', {
  # Specify the other units that are required for this test.
  # needs: ['controller:foo']
}

test 'it exists', (assert) ->
  route = @subject()
  assert.ok route
