`import Ember from 'ember'`

InvitationListComponent = Ember.Component.extend

  invitations: (->
    @get("store").findAll "invitation"
  ).property()

`export default InvitationListComponent`
