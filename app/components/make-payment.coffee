`import Ember from 'ember'`
`import ModalBoxMixin from 'irene/mixins/modal-box'`

MakePaymentComponent = Ember.Component.extend ModalBoxMixin,

  show:true

  didInsertElement: ->
    new Card
      form: "##{@elementId} form"
      container: "##{@elementId} .card-wrapper"

`export default MakePaymentComponent`
