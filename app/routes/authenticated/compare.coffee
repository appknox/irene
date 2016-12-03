`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedCompareRoute = Ember.Route.extend

  title: "File Compare"  + config.Platform
  model: (data)->
    files = data.files.split "..."
    {
      file: @get('store').find 'file', parseInt files[0]
      fileOld: @get('store').find 'file', parseInt files[1]
    }

`export default AuthenticatedCompareRoute`
