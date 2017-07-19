`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

CollaborationComponentComponent = Ember.Component.extend
  project: null
  selectedTeam: 0

  collaborations: (->
    projectId = @get "project.id"
    @get("store").query "collaboration", projectId: projectId
  ).property "project.id", "realtime.CollaborationCounter"

  teams: (->
    @get("store").findAll "team"
  ).property()

  actions:

    teamChanged: (value) ->
      @set "selectedTeam", parseInt @$('#team-preference').val()

    addCollaboration: ->
      selectedTeam = @get "selectedTeam"
      if selectedTeam is 0
        return @get("notify").error "Please select any team"
      that = @
      data =
        projectId: @get "project.id"
        teamId: selectedTeam
      that = @
      @get("ajax").post ENV.endpoints.collaborations, data:data
      .then (data)->
        that.send "closeModal"
        that.get("notify").success "Collaboration will be added shortly!"
      .catch (error) ->
        that.get("notify").error error.payload.message, ENV.notifications
        for error in error.errors
          that.get("notify").error error.detail?.message

    openCollaborationModal: ->
      @set "showCollaborationModal", true

    closeModal: ->
      @set "showCollaborationModal", false


`export default CollaborationComponentComponent`
