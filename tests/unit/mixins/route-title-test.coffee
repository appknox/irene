`import Ember from 'ember'`
`import RouteTitleMixin from '../../../mixins/route-title'`
`import { module, test } from 'qunit'`

module 'Unit | Mixin | route title'

# Replace this with your real tests.
test 'it works', (assert) ->
  RouteTitleObject = Ember.Object.extend RouteTitleMixin
  subject = RouteTitleObject.create()
  assert.ok subject
