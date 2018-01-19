`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedSettingsRoute = Ember.Route.extend ScrollTopMixin,

  title: "Settings | Appknox"
  model: ->
    @modelFor("authenticated")

`export default AuthenticatedSettingsRoute`
