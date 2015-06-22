`import { test, moduleFor } from 'ember-qunit'`

moduleFor 'controller:pricing', 'PricingController', {
  needs: ['controller:application']
}

test 'it exists', ->
  controller = @subject()
  ok controller
