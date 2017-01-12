`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedProjectRoute = Ember.Route.extend ScrollTopMixin,

  model: (params)->
    @store.findRecord "project", params.projectId

`export default AuthenticatedProjectRoute`
