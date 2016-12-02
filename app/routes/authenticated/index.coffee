`import Ember from 'ember'`
`import config from 'irene/config/environment';`

IndexRoute = Ember.Route.extend

  title: "Home" + config.Platform
  model: ->
    @modelFor("authenticated")

`export default IndexRoute`
