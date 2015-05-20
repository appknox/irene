`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`

UpgradePlanComponent = Ember.Component.extend
  needs: ['application']
  classNames: ['modal', 'fade', 'in']
  classNameBindings: ['show']
  show: false
  appCtrlr: null

  attachToApp: (->
    @get("appCtrlr").set "upgradePlan", @
  ).on "init"

  actions:

    closeModal: ->
      @set "show", false

    showModal: ->
      @set "show", true

    gotoPricing: ->
      @send "closeModal"

`export default UpgradePlanComponent`
