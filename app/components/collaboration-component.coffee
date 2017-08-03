`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

CollaborationComponentComponent = Ember.Component.extend

  i18n: Ember.inject.service()

  project: null
  selectedTeam: 0

  tSelectAnyTeam: t("selectAnyTeam")
  tCollaborationAdded: t("collaborationAdded")

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
      tSelectAnyTeam = @get "tSelectAnyTeam"
      tCollaborationAdded = @get "tCollaborationAdded"

      if selectedTeam is 0
        return @get("notify").error tSelectAnyTeam
      that = @
      data =
        projectId: @get "project.id"
        teamId: selectedTeam
      that = @
      @get("ajax").post ENV.endpoints.collaborations, data:data
      .then (data)->
        that.send "closeModal"
        that.get("notify").success tCollaborationAdded
      .catch (error) ->
        that.get("notify").error error.payload.message, ENV.notifications
        for error in error.errors
          that.get("notify").error error.detail?.message

    openCollaborationModal: ->
      @set "showCollaborationModal", true

    closeModal: ->
      @set "showCollaborationModal", false


`export default CollaborationComponentComponent`
