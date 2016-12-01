`import Ember from 'ember'`

IndexRoute = Ember.Route.extend

  titleToken: "Home"
  model: ->
    @modelFor("authenticated")

`export default IndexRoute`
