`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ENV from 'irene/config/environment'`

IndexRoute = Ember.Route.extend
  title: "Home" + config.platform
  model: ->
    @modelFor("authenticated")

`export default IndexRoute`
