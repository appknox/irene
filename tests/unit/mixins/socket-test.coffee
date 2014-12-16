`import Ember from 'ember'`
`import SocketMixin from 'irene/mixins/socket'`

module 'SocketMixin'

# Replace this with your real tests.
test 'it works', ->
  SocketObject = Ember.Object.extend SocketMixin
  subject = SocketObject.create()
  ok subject
