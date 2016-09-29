`import { moduleFor, test } from 'ember-qunit'`

moduleFor 'route:authenticated/file/compare', 'Unit | Route | authenticated/file/compare', {
  # Specify the other units that are required for this test.
  # needs: ['controller:foo']
}

test 'it exists', (assert) ->
  route = @subject()
  assert.ok route
