`import { test, moduleFor } from 'ember-qunit'`

moduleFor 'controller:file', 'FileController', {
  needs: ['controller:application']
}

# Replace this with your real tests.
test 'it exists', ->
  controller = @subject()
  ok controller

