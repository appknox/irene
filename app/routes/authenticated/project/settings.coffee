`import Ember from 'ember'`

AuthenticatedProjectSettingsRoute = Ember.Route.extend
  model: ->
    @get('store').findAll('collaboration')

`export default AuthenticatedProjectSettingsRoute`
