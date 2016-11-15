`import Ember from 'ember'`

InvitationRoute = Ember.Route.extend

  model: (params)->
    @store.findRecord "invitation", params.uuid

`export default InvitationRoute`
