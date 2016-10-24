`import Ember from 'ember'`

IndexRoute = Ember.Route.extend

  model: ->
    @get('store').findAll('project')

`export default IndexRoute`
