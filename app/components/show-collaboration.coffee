`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`

ShowCollaborationComponent = Ember.Component.extend
  collaboration: null
  isCurrentUserAdmin: false

  isOwner: (->
    collaboratorId = @get "collaboration.user.id"
    ownerId = @get "collaboration.project.owner.id"
    if ownerId is collaboratorId
      return true
    false
  ).property "collaboration.project.owner.id"

  canRemoveCollaboration: ( ->
    currentUserId = @container.lookup("controller:application").get "currentUser.id"
    collaboratorId = @get "collaboration.user.id"
    if @get "isOwner"
      return false
    if currentUserId is collaboratorId
      return true
    @get "isCurrentUserAdmin"
  ).property "collaboration.role", "isCurrentUserAdmin", "isOwner"

  actions:

    removeCollaboration: ->
      collaboration = @get "collaboration"
      collaboration.deleteRecord()

`export default ShowCollaborationComponent`
