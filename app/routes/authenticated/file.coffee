`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedFileRoute = Ember.Route.extend ScrollTopMixin,

  title: "File Details"  + config.platform
  model: (params)->
    @get('store').find('file', params.fileId)

`export default AuthenticatedFileRoute`
