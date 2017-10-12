`import { moduleFor, test } from 'ember-qunit'`

moduleFor 'route:authenticated/thank-you', 'Unit | Route | authenticated/thank you', {
  # Specify the other units that are required for this test.
  # needs: ['controller:foo']
}

test 'it exists', (assert) ->
  route = @subject()
  assert.ok route
