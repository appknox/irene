`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedPricingRoute = Ember.Route.extend

  title: "Pricing"  + config.platform
  model: ->
    @modelFor("authenticated")
  activate: ->
    window.scrollTo(0,0)    

`export default AuthenticatedPricingRoute`
