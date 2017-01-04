`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedSettingsRoute = Ember.Route.extend ScrollTopMixin,

  title: "Settings"  + config.platform
  model: ->
    @modelFor("authenticated")

`export default AuthenticatedSettingsRoute`
