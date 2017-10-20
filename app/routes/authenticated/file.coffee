`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedFileRoute = Ember.Route.extend ScrollTopMixin,

  title: "File Details"
  model: (params)->
    @get('store').find('file', params.fileId)

`export default AuthenticatedFileRoute`
