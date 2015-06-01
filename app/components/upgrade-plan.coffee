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

    getInTouch: ->
      that = @
      data =
        satisfied: false
        feedbackText: "*** GET IN TOUCH FOR PRICING ***"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.feedback].join '/'
      that = @
      Ember.$.post postUrl, data
      .then ->
        that.send "closeModal"
        Notify.success "We will get in touch with you soon. Thanks."
      .fail (xhr, message, status) ->
        if xhr.status is 403
          Notify.error xhr.responseJSON.message
        else
          Notify.error "A network error occured! Please try again later"

`export default UpgradePlanComponent`
