`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`

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
      return if !confirm "Do you want to remove `#{collaboration.get "user.username"}` from the list of collaborators?"
      postUrl = [ENV.APP.API_BASE, ENV.endpoints.deleteCollaborator, collaboration.get "id"].join '/'
      that = @
      Ember.$.post postUrl
        .then ->
          # collaboration.deleteRecord()
          Notify.success "#{ collaboration.get "user.username" } will be removed momentarily."
        .fail (xhr, message, status) ->
          Notify.error xhr.responseJSON.message

`export default ShowCollaborationComponent`
