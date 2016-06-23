`import Ember from 'ember'`
`import ConnectorMixin from '../../../mixins/connector'`
`import { module, test } from 'qunit'`

module 'ConnectorMixin'

# Replace this with your real tests.
test 'it works', (assert) ->
  ConnectorObject = Ember.Object.extend ConnectorMixin
  subject = ConnectorObject.create()
  assert.ok subject
