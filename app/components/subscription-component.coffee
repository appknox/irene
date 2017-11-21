`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

SubscriptionComponentComponent = Ember.Component.extend

  subscription: null
  i18n: Ember.inject.service()
  tSubscriptionCancelled: t("subscriptionCancelled")

  isNotPerScan: Ember.computed.not 'subscription.isPerScan'

  confirmCallback: ->
    tSubscriptionCancelled = @get "tSubscriptionCancelled"
    that = @
    subscription = @get "subscription"
    subscriptionId = @get "subscription.id"
    url = [ENV.endpoints.subscriptions, subscriptionId].join '/'
    @get("ajax").delete url
    .then (data) ->
      that.set "subscription.isCancelled", true
    .then (data) ->
      that.get("notify").success tSubscriptionCancelled
      that.send "closeCancelSubscriptionConfirmBox"
    .catch (error) ->
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:

    openCancelSubscriptionConfirmBox: ->
      @set "showCancelSubscriptionConfirmBox", true

    closeCancelSubscriptionConfirmBox: ->
      @set "showCancelSubscriptionConfirmBox", false

`export default SubscriptionComponentComponent`
