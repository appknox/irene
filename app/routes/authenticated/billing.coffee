`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedBillingRoute = Ember.Route.extend ScrollTopMixin,

  title: "Billing"  + config.platform
  model: ->
    @modelFor("authenticated")

`export default AuthenticatedBillingRoute`
