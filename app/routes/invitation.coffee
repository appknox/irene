`import Ember from 'ember'`

InvitationRoute = Ember.Route.extend

  setupController: (foo, params)->
    @controller.set "uuid", params.uuid
    @controller.checkInvitation()

`export default InvitationRoute`
