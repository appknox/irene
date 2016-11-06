`import Ember from 'ember'`

ModalCardComponent = Ember.Component.extend

  isActive: false
  classNames: ["modal"]
  classNameBindings: ['isActive:is-active']
  layoutName: "components/modal-card"

  actions:
    clearModal: ->
      @set "isActive", false

`export default ModalCardComponent`
