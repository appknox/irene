`import Ember from 'ember'`
`import config from 'irene/config/environment';`

InvitationRoute = Ember.Route.extend

  title: "Invitation" + config.platform

  model: (params)->
    @store.findRecord "invitation", params.uuid

`export default InvitationRoute`
