`import Ember from 'ember'`

InvitationRoute = Ember.Route.extend

  title: "Invitation"

  model: (params)->
    @store.findRecord "invitation", params.uuid

`export default InvitationRoute`
