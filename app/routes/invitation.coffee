`import Ember from 'ember'`

InvitationRoute = Ember.Route.extend

  title: "Invitation | Appknox"

  model: (params)->
    @store.findRecord "invitation", params.uuid

`export default InvitationRoute`
