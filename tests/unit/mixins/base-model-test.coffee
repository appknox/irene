`import Ember from 'ember'`
`import BaseModelMixin from 'irene/mixins/base-model'`

module 'BaseModelMixin'

# Replace this with your real tests.
test 'it works', ->
  BaseModelObject = Ember.Object.extend BaseModelMixin
  subject = BaseModelObject.create()
  ok subject
