`import Ember from 'ember'`
`import ModalBoxMixin from '../../../mixins/modal-box'`
`import { module, test } from 'qunit'`

module 'ModalBoxMixin'

# Replace this with your real tests.
test 'it works', (assert) ->
  ModalBoxObject = Ember.Object.extend ModalBoxMixin
  subject = ModalBoxObject.create()
  assert.ok subject
