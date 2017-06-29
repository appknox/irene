`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

CollaborationComponentComponent = Ember.Component.extend
  project: null
  currentTeam: 1

  collaborations: (->
    projectId = @get "project.id"
    @get("store").query "collaboration", projectId: projectId
  ).property "project.id", "realtime.CollaborationCounter"

  actions:

    teamChanged: (value) ->
      @set "currentTeam", parseInt value

    addCollaboration: ->
      that = @
      data =
        projectId: @get "project.id"
        teamId: @get "currentTeam"
      that = @
      @get("ajax").post ENV.endpoints.collaborations, data:data
      .then (data)->
        that.send "closeModal"
        that.get("notify").success "Collaboration added!"
      .catch (error) ->
        that.get("notify").error error.payload.message, ENV.notifications
        for error in error.errors
          that.get("notify").error error.detail?.message

    openCollaborationModal: ->
      @set "showCollaborationModal", true

    closeModal: ->
      @set "showCollaborationModal", false


`export default CollaborationComponentComponent`
