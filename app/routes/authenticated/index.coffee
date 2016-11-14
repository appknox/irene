`import Ember from 'ember'`

IndexRoute = Ember.Route.extend

  model: ->
    @modelFor("authenticated")

`export default IndexRoute`
