`import { test, moduleFor } from 'ember-qunit'`

moduleFor 'controller:project', 'ProjectController', {
  # Specify the other units that are required for this test.
  # needs: ['controller:foo']
  needs: ['controller:application']
}

# Replace this with your real tests.
test 'it exists', ->
  controller = @subject()
  ok controller

