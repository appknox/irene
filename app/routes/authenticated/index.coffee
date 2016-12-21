`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ENV from 'irene/config/environment'`

IndexRoute = Ember.Route.extend
  onboard: Ember.inject.service()
  title: "Home" + config.platform
  model: ->
    @modelFor("authenticated")

  actions:
    didTransition: ->
      this.set('onboard.activeTour', ENV.TOUR.newScan)

`export default IndexRoute`
