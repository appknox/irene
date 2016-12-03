`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedChooseRoute = Ember.Route.extend

  title: "Choose File"  + config.platform
  model: (params)->
    @get('store').find('file', params.fileId)

`export default AuthenticatedChooseRoute`
