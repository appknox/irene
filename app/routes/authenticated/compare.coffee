`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedCompareRoute = Ember.Route.extend ScrollTopMixin,

  title: "File Compare"  + config.platform
  model: (data)->
    files = data.files.split "..."
    {
      file: @get('store').find 'file', parseInt files[0]
      fileOld: @get('store').find 'file', parseInt files[1]
    }

`export default AuthenticatedCompareRoute`
