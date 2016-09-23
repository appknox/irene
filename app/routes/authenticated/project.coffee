`import Ember from 'ember'`

AuthenticatedProjectRoute = Ember.Route.extend
  model: ()->
    @get('store').findAll('vulnerability')

`export default AuthenticatedProjectRoute`
