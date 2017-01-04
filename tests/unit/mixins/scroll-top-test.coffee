`import Ember from 'ember'`
`import ScrollTopMixin from '../../../mixins/scroll-top'`
`import { module, test } from 'qunit'`

module 'Unit | Mixin | scroll top'

# Replace this with your real tests.
test 'it works', (assert) ->
  ScrollTopObject = Ember.Object.extend ScrollTopMixin
  subject = ScrollTopObject.create()
  assert.ok subject
