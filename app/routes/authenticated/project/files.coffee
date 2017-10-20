`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedProjectFilesRoute = Ember.Route.extend ScrollTopMixin,

  title: "All Files"
  model: ->
    @modelFor("authenticated.project")

`export default AuthenticatedProjectFilesRoute`
