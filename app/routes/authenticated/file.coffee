`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedFileRoute = Ember.Route.extend

  title: "File Details"  + config.Platform
  model: (params)->
    @get('store').find('file', params.fileId)

`export default AuthenticatedFileRoute`
