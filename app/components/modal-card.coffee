`import Ember from 'ember'`

ModalCardComponent = Ember.Component.extend

  isActive: true
  classNames: ["modal"]
  classNameBindings: ['isActive:is-active']

  actions:
    clearModal: ->
      @set "isActive", false

`export default ModalCardComponent`
