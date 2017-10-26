`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

AuthenticatedChooseRoute = Ember.Route.extend ScrollTopMixin, RouteTitleMixin,

  subtitle: "Choose File"
  model: (params)->
    @get('store').find('file', params.fileId)


`export default AuthenticatedChooseRoute`
