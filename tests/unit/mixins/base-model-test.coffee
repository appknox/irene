`import Ember from 'ember'`
`import BaseModelMixin from '../../../mixins/base-model'`
`import { module, test } from 'qunit'`

module 'Unit | Mixin | base model'

# Replace this with your real tests.
test 'it works', (assert) ->
  BaseModelObject = Ember.Object.extend BaseModelMixin
  subject = BaseModelObject.create()
  assert.ok subject
