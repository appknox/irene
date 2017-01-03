`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedChooseRoute = Ember.Route.extend

  title: "Choose File"  + config.platform
  model: (params)->
    @get('store').find('file', params.fileId)
  activate: ->
    window.scrollTo(0,0)    

`export default AuthenticatedChooseRoute`
