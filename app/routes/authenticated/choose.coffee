`import Ember from 'ember'`

AuthenticatedChooseRoute = Ember.Route.extend

  titleToken: "Choose File"
  model: (params)->
    @get('store').find('file', params.fileId)

`export default AuthenticatedChooseRoute`
