`import Ember from 'ember'`

IndexRoute = Ember.Route.extend

  model: ->
    @modelFor("authenticated").get('projects')

`export default IndexRoute`
