`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedFileRoute = Ember.Route.extend

  title: "File Details"  + config.platform
  model: (params)->
    @get('store').find('file', params.fileId)
  activate: ->
    window.scrollTo(0,0)  

`export default AuthenticatedFileRoute`
