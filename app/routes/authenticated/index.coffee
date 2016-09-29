`import Ember from 'ember'`

IndexRoute = Ember.Route.extend
  breadCrumb:
    title: 'Home'

  model: ->
    @get('store').findAll('project')

`export default IndexRoute`
