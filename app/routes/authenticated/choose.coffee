`import Ember from 'ember'`

AuthenticatedChooseRoute = Ember.Route.extend
  model: (params)->
    @get('store').find('file', params.fileId)

`export default AuthenticatedChooseRoute`
