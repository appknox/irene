`import Ember from 'ember'`

AuthenticatedCompareRoute = Ember.Route.extend

  titleToken: "File Compare"
  model: (data)->
    files = data.files.split "..."
    {
      file: @get('store').find 'file', parseInt files[0]
      fileOld: @get('store').find 'file', parseInt files[1]
    }

`export default AuthenticatedCompareRoute`
