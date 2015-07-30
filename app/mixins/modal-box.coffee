`import Ember from 'ember'`

ModalBoxMixin = Ember.Mixin.create
  classNames: ['modal', 'fade', 'in']
  classNameBindings: ['show']
  show: true
  appCtrlrProperty: null  # The application controller's property that this modal inject itself to

  attachToApp: (->
    applicationController = @container.lookup "controller:application"
    property = "#{@toString().split(":")[1].camelize()}Modal"
    applicationController.set property, @
  ).on "init"

  actions:

    closeModal: ->
      @set "show", false

    showModal: ->
      @set "show", true

`export default ModalBoxMixin`
