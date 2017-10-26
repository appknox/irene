`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

AuthenticatedFileRoute = Ember.Route.extend ScrollTopMixin, RouteTitleMixin,

  subtitle: "File Details"
  model: (params)->
    @get('store').find('file', params.fileId)

`export default AuthenticatedFileRoute`
