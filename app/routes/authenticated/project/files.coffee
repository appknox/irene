`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

AuthenticatedProjectFilesRoute = Ember.Route.extend ScrollTopMixin, RouteTitleMixin,

  subtitle: "All Files"
  model: ->
    @modelFor("authenticated.project")

`export default AuthenticatedProjectFilesRoute`
