`import Ember from 'ember'`
`import PaginateMixin from '../../../mixins/paginate'`
`import { module, test } from 'qunit'`

module 'Unit | Mixin | paginate'

# Replace this with your real tests.
test 'it works', (assert) ->
  PaginateObject = Ember.Object.extend PaginateMixin
  subject = PaginateObject.create()
  assert.ok subject
